from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
	postgres_host: str
	postgres_port: int
	postgres_db: str
	postgres_user: str
	postgres_password: str

	redis_host: str
	redis_port: int

	model_config = SettingsConfigDict(
		env_file=".env",
		case_sensitive=False,
	)

settings = Settings()
