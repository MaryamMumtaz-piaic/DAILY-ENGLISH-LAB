from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    fastapi_env: str = "development"
    internal_api_key: str

    # LLM
    llm_provider: str = "openai"
    llm_api_key: str
    llm_model: str = "gpt-4o"

    # STT
    stt_provider: str = "openai-whisper"
    stt_api_key: str = ""

    # TTS
    tts_provider: str = "openai-tts"
    tts_api_key: str = ""
    tts_voice: str = "alloy"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
