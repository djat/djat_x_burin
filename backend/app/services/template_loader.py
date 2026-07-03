from __future__ import annotations

from pathlib import Path

import yaml

from app.models.pathway import PathwayTemplate, new_template_id

BURIN_PATHWAYS_DIR = Path(__file__).resolve().parents[3] / "burin-pathways" / "pathways"


def load_yaml_templates() -> list[dict]:
    templates = []
    if not BURIN_PATHWAYS_DIR.exists():
        return templates
    for path in sorted(BURIN_PATHWAYS_DIR.glob("*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if data:
            data["_source_file"] = path.name
            templates.append(data)
    return templates


def template_to_row(data: dict) -> PathwayTemplate:
    identity = f"{data['domain']}.{data['subdomain']}.{data['action']}@v{data.get('version', 1)}"
    return PathwayTemplate(
        id=new_template_id(),
        domain=data["domain"],
        subdomain=data["subdomain"],
        action=data["action"],
        version=int(data.get("version", 1)),
        display_name=data.get("display_name", identity),
        description=data.get("description", ""),
        steps_json=data.get("steps", []),
        input_contract=data.get("input_contract", {}),
        output_contract=data.get("output_contract", {}),
        license_terms=data.get("license_terms", {}),
        tags=data.get("tags", []),
        is_system=bool(data.get("is_system", True)),
    )


def identity_of(template: PathwayTemplate) -> str:
    return f"{template.domain}.{template.subdomain}.{template.action}@v{template.version}"


def find_template_by_identity(db, identity: str) -> PathwayTemplate | None:
    for t in db.query(PathwayTemplate).all():
        if identity_of(t) == identity:
            return t
    return None
