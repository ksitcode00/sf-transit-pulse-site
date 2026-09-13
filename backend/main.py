"""FastAPI boundary for SF Transit Pulse Feature 16A.

中文：GitHub Pages 只负责显示；这个服务负责搜索站点和计算行程。
English: GitHub Pages renders the product; this service owns stop search and trip planning.
"""

from __future__ import annotations

import os
from pathlib import Path
from threading import Lock
import time
from typing import Literal
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.planner import NoJourneyError, PlannerEngine, PlannerError, UnsupportedStopError


ROOT = Path(__file__).resolve().parents[1]
LOCAL_NETWORK_PATH = ROOT / "site/data/network.json"
LOCAL_REALTIME_PATH = ROOT / "site/data/latest.json"
NETWORK_SOURCE = os.environ.get("SF_TRANSIT_NETWORK_SOURCE", str(LOCAL_NETWORK_PATH))
REALTIME_SOURCE = os.environ.get("SF_TRANSIT_REALTIME_SOURCE", str(LOCAL_REALTIME_PATH))
REMOTE_CACHE_SECONDS = 300
DEFAULT_ORIGINS = [
    "http://127.0.0.1:8765",
    "http://localhost:8765",
    "https://ksitcode00.github.io",
]


class PlanTripRequest(BaseModel):
    """Browser-to-backend request; IDs come from the public stop catalog."""

    origin_stop_id: str = Field(min_length=1, max_length=40)
    destination_stop_id: str = Field(min_length=1, max_length=40)
    mode: Literal["FASTEST", "BALANCED", "SAFETY_FIRST"] = "BALANCED"


class PlannerRepository:
    """Reload local files or the published GitHub Pages cache at a controlled interval."""

    def __init__(self, network_source: str, realtime_source: str):
        self.network_source = network_source
        self.realtime_source = realtime_source
        self._signature: tuple[object, object] | None = None
        self._engine: PlannerEngine | None = None
        self._lock = Lock()

    @staticmethod
    def _is_remote(source: str) -> bool:
        return source.startswith(("https://", "http://"))

    def _source_signature(self, source: str) -> object:
        if self._is_remote(source):
            return int(time.monotonic() // REMOTE_CACHE_SECONDS)
        return Path(source).stat().st_mtime_ns

    def _read_json(self, source: str) -> dict:
        if not self._is_remote(source):
            import json

            return json.loads(Path(source).read_text(encoding="utf-8"))
        request = Request(source, headers={"User-Agent": "SF-Transit-Pulse-Planner/20.1"})
        with urlopen(request, timeout=30) as response:
            import json

            return json.loads(response.read().decode("utf-8"))

    def _load_engine(self) -> PlannerEngine:
        try:
            return PlannerEngine(
                self._read_json(self.network_source),
                self._read_json(self.realtime_source),
            )
        except Exception:
            # 中文：远端快照短暂失败时，首次启动仍可使用随部署打包的最后一份有效缓存。
            # English: A cold start can fall back to the last bundled snapshot if Pages is unavailable.
            if self._engine is not None:
                return self._engine
            return PlannerEngine.from_files(LOCAL_NETWORK_PATH, LOCAL_REALTIME_PATH)

    def get(self) -> PlannerEngine:
        signature = (
            self._source_signature(self.network_source),
            self._source_signature(self.realtime_source),
        )
        with self._lock:
            if self._engine is None or signature != self._signature:
                self._engine = self._load_engine()
                self._signature = signature
            return self._engine


allowed_origins = [
    value.strip()
    for value in os.environ.get("SF_TRANSIT_ALLOWED_ORIGINS", ",".join(DEFAULT_ORIGINS)).split(",")
    if value.strip()
]
repository = PlannerRepository(NETWORK_SOURCE, REALTIME_SOURCE)
app = FastAPI(
    title="SF Transit Pulse Planner API",
    version="20.1",
    description="Trip-level direct and one-transfer Muni planning from credential-free caches.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict:
    engine = repository.get()
    return {
        "status": "ok",
        "routes": len(engine.list_routes()),
        "stops": len(engine.stops),
        "route_directions": len(engine.patterns),
        "realtime_status": engine.realtime.get("meta", {}).get("status"),
    }


@app.get("/routes")
def routes() -> dict:
    return {"routes": repository.get().list_routes()}


@app.get("/stops")
def stops(
    q: str = Query(default="", max_length=100),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    return {"stops": repository.get().list_stops(q, limit)}


@app.get("/route/{route_id}")
def route(route_id: str) -> dict:
    try:
        return repository.get().route_detail(route_id)
    except PlannerError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/plan-trip")
def plan_trip(request: PlanTripRequest) -> dict:
    try:
        return repository.get().plan(
            origin_stop_id=request.origin_stop_id,
            destination_stop_id=request.destination_stop_id,
            mode=request.mode,
        )
    except UnsupportedStopError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except NoJourneyError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except PlannerError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
