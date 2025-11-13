from pathlib import Path
from typing import List, Optional, Union

from pydantic import AnyHttpUrl, ConfigDict, Field, field_validator, ValidationInfo
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = Field(default="Rudi Backend", env="PROJECT_NAME")
    API_V1_STR: str = Field(default="/api/v1", env="API_V1_STR")
    SECRET_KEY: str = Field(default="your-secret-key-here", env="SECRET_KEY")
    SIGNING_KEY: str = Field(default="your-signing-key-here", env="SIGNING_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 8, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
        ],
        env="BACKEND_CORS_ORIGINS",
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls, v: Union[str, List[str]]
    ) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = ConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra='ignore',
    )


settings = Settings()
