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
    Preview first 10 rows and column names from a table.
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
            result = conn.execute(text(f"SELECT * FROM {config.table_name} LIMIT 10"))
            rows = [dict(row) for row in result]
            meta = MetaData()
            table = Table(config.table_name, meta, autoload_with=engine)
            columns = [col.name for col in table.columns]
        return {"columns": columns, "rows": rows}
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
    tables: List[str]

@app.post("/generate-data-model/")
def generate_data_model(config: ModelRequest):
    """
    Generate data model and SQL using GPT based on database schema.
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
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Model generation failed: {str(e)}")
