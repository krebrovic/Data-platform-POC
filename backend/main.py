from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi import Body
import sqlalchemy

app = FastAPI()

class DBConfig(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str

@app.post("/connect-db/")
def connect_db(config: DBConfig):
    try:
        url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            result = conn.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [row[0] for row in result]
        return {"status": "success", "tables": tables}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

class TablePreviewRequest(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str
    table_name: str

@app.post("/preview-table/")
def preview_table(config: TablePreviewRequest):
    try:
        url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            # Get first 10 rows
            result = conn.execute(sqlalchemy.text(f"SELECT * FROM {config.table_name} LIMIT 10"))
            rows = [dict(row) for row in result]
            # Get column info
            meta = sqlalchemy.MetaData()
            table = sqlalchemy.Table(config.table_name, meta, autoload_with=engine)
            columns = [col.name for col in table.columns]
        return {"columns": columns, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preview failed: {str(e)}")