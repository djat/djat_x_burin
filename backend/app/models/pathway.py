import json
import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RunStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    HALTED = "HALTED"


class PathwayTemplate(Base):
    __tablename__ = "pathway_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    domain: Mapped[str] = mapped_column(String)
    subdomain: Mapped[str] = mapped_column(String)
    action: Mapped[str] = mapped_column(String)
    version: Mapped[int] = mapped_column(Integer, default=1)
    display_name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    steps_json: Mapped[list] = mapped_column(JSON)
    input_contract: Mapped[dict] = mapped_column(JSON, default=dict)
    output_contract: Mapped[dict] = mapped_column(JSON, default=dict)
    license_terms: Mapped[dict] = mapped_column(JSON, default=dict)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_system: Mapped[bool] = mapped_column(default=True)


class PathwayRun(Base):
    __tablename__ = "pathway_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"pr_{uuid.uuid4().hex[:12]}")
    pathway_id: Mapped[str] = mapped_column(String)
    template_identity: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default=RunStatus.PENDING.value)
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    inputs_json: Mapped[dict] = mapped_column(JSON, default=dict)
    step_executions_json: Mapped[list] = mapped_column(JSON, default=list)
    step_artifacts_json: Mapped[dict] = mapped_column(JSON, default=dict)
    final_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    aqua_stub_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)


def new_template_id() -> str:
    return f"pw_{uuid.uuid4().hex[:12]}"
