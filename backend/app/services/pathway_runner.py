from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.pathway import PathwayRun, PathwayTemplate, RunStatus
from app.services.pathway_executor import PathwayExecutor, make_aqua_stub_id
from app.services.template_loader import identity_of


class PathwayRunner:
    async def launch(
        self, db: Session, template: PathwayTemplate, inputs: dict, linked_runs: dict | None = None
    ) -> PathwayRun:
        steps = template.steps_json
        run = PathwayRun(
            pathway_id=template.id,
            template_identity=identity_of(template),
            status=RunStatus.RUNNING.value,
            current_step=0,
            total_steps=len(steps),
            inputs_json=inputs,
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        executor = PathwayExecutor(template, inputs, linked_runs=linked_runs)
        try:
            executions, artifacts, final_output = await executor.execute_all()
            run.step_executions_json = executions
            run.step_artifacts_json = {str(k): v for k, v in artifacts.items()}
            run.current_step = len(executions)
            run.final_output = final_output
            run.aqua_stub_id = make_aqua_stub_id(run.id, run.template_identity)
            if executor.halted:
                run.status = RunStatus.HALTED.value
                run.error_message = executor.halt_reason
            else:
                run.status = RunStatus.COMPLETED.value
            run.completed_at = datetime.now(timezone.utc)
        except Exception as exc:
            run.status = RunStatus.FAILED.value
            run.error_message = str(exc)
            run.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(run)
        return run
