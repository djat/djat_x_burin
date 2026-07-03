import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ConservationParty(Base):
    __tablename__ = "conservation_parties"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    did: Mapped[str] = mapped_column(String, unique=True)
    role: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    organization: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")


class ConservationProgram(Base):
    __tablename__ = "conservation_programs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    funder_party_id: Mapped[str] = mapped_column(String)
    program_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    trust_card_json: Mapped[dict] = mapped_column(JSON, default=dict)
    acceptance_policy_json: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String, default="DRAFT")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class ConservationReportingUnit(Base):
    __tablename__ = "conservation_reporting_units"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    program_id: Mapped[str] = mapped_column(String)
    unit_code: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    unit_type: Mapped[str] = mapped_column(String)
    source_ref: Mapped[str] = mapped_column(String)
    geojson: Mapped[dict] = mapped_column(JSON)
    boundary_fingerprint: Mapped[str | None] = mapped_column(String, nullable=True)


class ConservationGrant(Base):
    __tablename__ = "conservation_grants"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    program_id: Mapped[str] = mapped_column(String)
    grantee_party_id: Mapped[str] = mapped_column(String)
    unit_id: Mapped[str] = mapped_column(String)
    award_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    boundary_fingerprint: Mapped[str | None] = mapped_column(String, nullable=True)
    award_amount_usd: Mapped[float] = mapped_column(Float, default=0)
    reporting_quarters: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String, default="ACTIVE")


class ConservationSubmission(Base):
    __tablename__ = "conservation_submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    grant_id: Mapped[str] = mapped_column(String)
    monitor_party_id: Mapped[str] = mapped_column(String)
    quarter: Mapped[str] = mapped_column(String)
    transect_ids: Mapped[list] = mapped_column(JSON, default=list)
    field_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    review_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="PENDING")


class PathwayRunLink(Base):
    __tablename__ = "pathway_run_links"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"link_{uuid.uuid4().hex[:12]}")
    parent_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    child_run_id: Mapped[str] = mapped_column(String)
    edge_role: Mapped[str] = mapped_column(String)
    party_did: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_type: Mapped[str] = mapped_column(String, default="")
    entity_id: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class ConservationQuarterClose(Base):
    __tablename__ = "conservation_quarter_closes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    program_id: Mapped[str] = mapped_column(String)
    quarter: Mapped[str] = mapped_column(String)
    verify_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    close_run_id: Mapped[str | None] = mapped_column(String, nullable=True)
    verification_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String, default="OPEN")
