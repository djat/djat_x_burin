from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone

from app.models.pathway import RunStatus
from app.services.burin_agents import burin_agents
from app.services.conservation_agents import conservation_agents
from app.services.trustkey_agents import trustkey_agents


class PathwayExecutor:
    def __init__(self, template, run_inputs: dict, linked_runs: dict | None = None):
        self.template = template
        self.inputs = run_inputs
        self.linked_runs = linked_runs or {}
        self.artifacts: dict[int, dict] = {}
        self.executions: list[dict] = []
        self.current_content = ""
        self.halted = False
        self.halt_reason: str | None = None

    async def execute_all(self) -> tuple[list[dict], dict[int, dict], str]:
        steps = sorted(self.template.steps_json, key=lambda s: s["order"])
        for step in steps:
            if self.halted:
                break
            order = step["order"]
            agent_id = step["agent_id"]
            skill = step.get("skill", "default")
            config = step.get("config", {})

            context = {
                "inputs": self.inputs,
                "artifacts": self.artifacts,
                "current_content": self.current_content,
                "linked_runs": self.linked_runs,
            }

            started = datetime.now(timezone.utc).isoformat()
            try:
                if agent_id.startswith("burin_"):
                    md, artifact = burin_agents.run(agent_id, skill, config, context)
                elif agent_id.startswith("conservation_"):
                    md, artifact = conservation_agents.run(agent_id, skill, config, context)
                elif agent_id == "pathways_trustkey":
                    md, artifact = trustkey_agents.run(agent_id, skill, config, context)
                elif agent_id == "application":
                    md, artifact = self._application_agent(skill, config, context)
                else:
                    md, artifact = f"Step {order} ({agent_id}) completed.", {"artifact_type": "noop"}

                self.artifacts[order] = artifact
                self.current_content = md

                # R5 halt on fraud
                if artifact.get("artifact_type") == "burin_fraud_check" and artifact.get("fraud_detected"):
                    self.halted = True
                    self.halt_reason = "Fraud detected — R5 halt"

                self.executions.append(
                    {
                        "order": order,
                        "agent_id": agent_id,
                        "skill": skill,
                        "status": "HALTED" if self.halted else "COMPLETED",
                        "started_at": started,
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                        "output_markdown": md,
                        "artifact": artifact,
                    }
                )
            except Exception as exc:
                self.executions.append(
                    {
                        "order": order,
                        "agent_id": agent_id,
                        "skill": skill,
                        "status": "FAILED",
                        "error": str(exc),
                    }
                )
                raise

        return self.executions, self.artifacts, self.current_content

    def _application_agent(self, skill: str, config: dict, context: dict) -> tuple[str, dict]:
        if skill == "assemble_dual_attestation_bundle":
            return burin_agents.run("burin_export", skill, config, context)
        return f"Application skill `{skill}` executed.", {"artifact_type": "application", "skill": skill}


def make_aqua_stub_id(run_id: str, template_identity: str) -> str:
    payload = f"{run_id}:{template_identity}:{datetime.now(timezone.utc).isoformat()}"
    return "aqua_stub_" + hashlib.sha256(payload.encode()).hexdigest()[:16]
