from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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