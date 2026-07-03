from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pathway import PathwayTemplate
from app.services.template_loader import identity_of

router = APIRouter(prefix="/api/pathway-templates", tags=["pathway-templates"])


class TemplateOut(BaseModel):
    id: str
    identity: str
    display_name: str
    description: str
    domain: str
    subdomain: str
    action: str
    version: int
    steps: list
    input_contract: dict
    license_terms: dict
    tags: list

    class Config:
        from_attributes = True


@router.get("", response_model=list[TemplateOut])
def list_templates(db: Session = Depends(get_db)):
    rows = db.query(PathwayTemplate).all()
    return [
        TemplateOut(
            id=t.id,
            identity=identity_of(t),
            display_name=t.display_name,
            description=t.description,
            domain=t.domain,
            subdomain=t.subdomain,
            action=t.action,
            version=t.version,
            steps=t.steps_json,
            input_contract=t.input_contract,
            license_terms=t.license_terms,
            tags=t.tags,
        )
        for t in rows
    ]


@router.get("/{template_id}", response_model=TemplateOut)
def get_template(template_id: str, db: Session = Depends(get_db)):
    t = db.query(PathwayTemplate).filter(PathwayTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    return TemplateOut(
        id=t.id,
        identity=identity_of(t),
        display_name=t.display_name,
        description=t.description,
        domain=t.domain,
        subdomain=t.subdomain,
        action=t.action,
        version=t.version,
        steps=t.steps_json,
        input_contract=t.input_contract,
        license_terms=t.license_terms,
        tags=t.tags,
    )
