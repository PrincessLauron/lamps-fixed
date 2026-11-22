from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from services.analytics import build_summary

app = FastAPI(title="LAMS Analytics Service", version="1.0.0")


class LamsState(BaseModel):
    model_config = ConfigDict(extra="allow")
    assets: list[dict[str, Any]] = Field(default_factory=list)
    bookings: list[dict[str, Any]] = Field(default_factory=list)
    alerts: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analytics/summary")
def summary(state: LamsState) -> dict[str, Any]:
    try:
        return build_summary(state.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
