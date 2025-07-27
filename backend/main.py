from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlalchemy
from sqlalchemy import text, MetaData, Table
from openai import OpenAI
import os

app = FastAPI(title="CloudBricks API", description="Smarter Data Solutions Platform", version="1.0.0")

# Add CORS middleware (allow all origins for testing, restrict in production!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Or ["https://your-frontend.onrender.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI Client (ensure OPENAI_API_KEY is set in Render env vars)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Default DB credentials - replace with your actual connection details!
DEFAULT_DB = {
    "host": "dpg-d1qkl17fte5s73dfjmag-a",  # Render internal host
    "port": 5432,
    "user": "krebrovic",
    "password": "D5YZVGXfXOOS0U5tHbjJIujUhLoxeyNu",
    "database": "dp_db_4ra7"
}

# Database config model - all fields optional for silent connect
class DBConfig(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to CloudBricks Backend API 🚀", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/connect-db/")
def connect_db(config: DBConfig = Body(default={})):
    """
    Connect to the database and list public tables.
    Uses default credentials if fields are missing.
    """
    try:
        host = config.host or DEFAULT_DB["host"]
        port = config.port or DEFAULT_DB["port"]
        user = config.user or DEFAULT_DB["user"]
        password = config.password or DEFAULT_DB["password"]
        database = config.database or DEFAULT_DB["database"]

        url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        print("Connecting to:", url)
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
        return {"status": "success", "tables": tables}
    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

# Table preview model (make all optional for convenience)
class TablePreviewRequest(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None
    table_name: str

@app.post("/preview-table/")
def preview_table(config: TablePreviewRequest):
    """
    Return columns and their types for a given table.
    """
    try:
        host = config.host or DEFAULT_DB["host"]
        port = config.port or DEFAULT_DB["port"]
        user = config.user or DEFAULT_DB["user"]
        password = config.password or DEFAULT_DB["password"]
        database = config.database or DEFAULT_DB["database"]

        url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            # Get columns (name + type) for this table
            result = conn.execute(
                text(
                    """
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = :table_name
                    ORDER BY ordinal_position
                    """
                ),
                {"table_name": config.table_name},
            )
            columns = [{"name": row[0], "type": row[1]} for row in result]

        return {"columns": columns}
    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Preview failed: {str(e)}")

# Data model generation request (optional logic)


class ModelRequest(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None
    tables: Optional[dict] = None  # Now expected as dict: {table_name: [col1, col2, ...]}


@app.post("/generate-data-model/")
@app.post("/generate-data-model/")
def generate_data_model(config: ModelRequest = Body(...)):
    """
    Generate data model and SQL using GPT based on selected table columns.
    Expects tables as a dict: { "table_name": ["col1", "col2", ...], ... }
    """
    try:
        host = config.host or DEFAULT_DB["host"]
        port = config.port or DEFAULT_DB["port"]
        user = config.user or DEFAULT_DB["user"]
        password = config.password or DEFAULT_DB["password"]
        database = config.database or DEFAULT_DB["database"]

        url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        engine = sqlalchemy.create_engine(url)

        schema_info = ""
        # config.tables is now a dict: {table_name: [col1, col2, ...]}
        for table_name, selected_cols in (config.tables or {}).items():
            meta = MetaData()
            table = Table(table_name, meta, autoload_with=engine)
            schema_info += f"Table: {table_name}\n"
            for col in table.columns:
                if col.name in selected_cols:
                    schema_info += f"- {col.name}: {col.type}\n"
            schema_info += "\n"

        prompt = f"""
                    You are a senior data engineer building a modern, cloud-native data lakehouse on AWS using Glue Data Catalog and S3 as the storage layer.

                    Given the following source table schemas (with only the listed columns):
                    {schema_info}

                    For each source table:

                    1. Design a RAW zone table as a Glue Catalog EXTERNAL TABLE, using S3 as the storage location. Use the same name as the source table, suffixed with _raw (e.g., customer_raw).
                    2. Choose optimal file format (Parquet recommended for analytics, else CSV if needed).
                    3. The external table DDL should include:
                    - All the listed columns, mapped to compatible AWS Athena/Presto data types.
                    - Standard audit columns:
                        - dw_created_at TIMESTAMP
                        - dw_updated_at TIMESTAMP
                        - batch_id STRING
                        - (Add any other best practice audit columns you recommend.)
                    - Storage location on S3: Use placeholder like s3://cloudbricks-dp/raw/{table_name}_raw/
                    - Table properties and SerDe settings for your format (Parquet or CSV).

                    4. Generate the full DDL (CREATE EXTERNAL TABLE) for each RAW table.

                    5. Generate a sample SQL script for inserting/loading data from the source PostgreSQL table to S3 (describe the recommended ETL/ELT approach, e.g., extract to Parquet using Spark or Pandas, upload to S3, then MSCK REPAIR TABLE to refresh partitions if needed).

                    6. Output:
                    - The Glue-compatible DDL for each RAW table
                    - Example ETL code (pseudocode or PySpark/pandas+boto3) to extract from Postgres and write to S3 in the correct format
                    - Any notes on schema or improvement recommendations
                    - Follow modern data engineering best practices (naming, types, audit columns, conventions)

                    Format your answer clearly with code blocks and explanations.
                """

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"model": completion.choices[0].message.content}

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Model generation failed: {str(e)}")
