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
                    You are a senior data engineer designing a modern data warehouse.

                    Given the following source table schemas (with only the listed columns):
                    {schema_info}

                    For each source table:
                    1. Create a RAW table for it in the data warehouse. The RAW table should have the same columns as the source table, use the same name as the source table with the suffix _raw (e.g., customer_raw), and follow best practices for data warehouse raw zones.
                    2. Add standard audit columns to each RAW table:
                    - dw_created_at TIMESTAMP
                    - dw_updated_at TIMESTAMP
                    - batch_id VARCHAR
                    (You may add others if you recommend.)
                    3. Generate the full DDL (CREATE TABLE statements) for these RAW tables, specifying data types (use SQL standard/Postgres types).
                    4. For each table, generate a SQL script to perform a full load from source to warehouse RAW table:
                    a) DELETE FROM {table}_raw;
                    b) INSERT INTO {table}_raw (...columns..., audit columns) SELECT ...columns..., current_timestamp, current_timestamp, <batch_id> FROM {table_name};
                    (Assume simple 1:1 mapping for now.)

                    Output:
                    - The DDLs for each RAW table
                    - The full SQL loading scripts (delete + insert) for each
                    - If you see issues in the schemas, call out and recommend improvements
                    - Follow data engineering best practices (naming, types, audit columns, conventions)

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
