from fastapi import FastAPI
from sqlalchemy import text

from app.db.postgres import engine
from app.db.redis import redis_client

app = FastAPI(
	title="COINX API",
	version="0.1.0",
)


@app.get("/health")
def health():
	return {
		"status": "ok",
		"service": "coinx-api",
	}

@app.get("/health/database")
def database_health():
	with engine.connect() as connection:
		connection.execute(text("SELECT 1"))

	return {
		"status" : "ok",
		"service" : "postgresql",
	}

@app.get("/health/redis")
def redis_health():
	redis_client.ping()

	return {
		"status" : "ok",
		"service" : "redis",
	}
