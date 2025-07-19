from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sqlalchemy
from sqlalchemy import text, MetaData, Table
from openai import OpenAI
import os

app = FastAPI(title="CloudBricks API", description="Smarter Data Solutions Platform", version="1.0.0")

# OpenAI Client (ensure OPENAI_API_KEY is set in Render env vars)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to CloudBricks Backend API 🚀", "docs": "/docs"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Database config model
class DBConfig(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str

@app.post("/connect-db/")
def connect_db(config: DBConfig):
    """
    Connect to the database and list public tables.
    """
    try:
        url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
        return {"status": "success", "tables": tables}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

# Table preview model
class TablePreviewRequest(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str
    table_name: str

@app.post("/preview-table/")
def preview_table(config: TablePreviewRequest):
    """
    Preview first 10 rows and column names from a table.
    """
    try:
        url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT * FROM {config.table_name} LIMIT 10"))
            rows = [dict(row) for row in result]
            meta = MetaData()
            table = Table(config.table_name, meta, autoload_with=engine)
            columns = [col.name for col in table.columns]
        return {"columns": columns, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preview failed: {str(e)}")

# Data model generation request
class ModelRequest(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str
    tables: List[str]

@app.post("/generate-data-model/")
def generate_data_model(config: ModelRequest):
    """
    Generate data model and SQL using GPT based on database schema.
    """
    try:
        url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = sqlalchemy.create_engine(url)

        schema_info = ""
        for table_name in config.tables:
            meta = MetaData()
            table = Table(table_name, meta, autoload_with=engine)
            schema_info += f"Table: {table_name}\n"
            for col in table.columns:
                schema_info += f"- {col.name}: {col.type}\n"
            schema_info += "\n"

        prompt = f"""You are a data architect. Based on the following table schemas, infer foreign key relationships and generate a data model and SQL CREATE TABLE statements:

{schema_info}

Output the relationships and SQL statements.
"""

        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"model": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model generation failed: {str(e)}")
