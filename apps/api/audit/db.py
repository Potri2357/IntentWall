"""
Database Connection and Repository Helper Functions
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from apps.api.audit.models import Base, PolicyModel, PolicyVersionModel, SimulationRunModel, AuditEventModel

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "intentwall.db")
engine = create_engine(f"sqlite:///{os.path.abspath(DB_PATH)}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def log_audit_event(action: str, object_ref: str, payload: Dict[str, Any], actor: str = "security-admin"):
    with SessionLocal() as db:
        event = AuditEventModel(
            id=f"aud_{uuid.uuid4().hex[:8]}",
            actor=actor,
            action=action,
            object_ref=object_ref,
            payload_json=json.dumps(payload),
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()


def get_all_policies() -> List[Dict[str, Any]]:
    with SessionLocal() as db:
        policies = db.query(PolicyModel).order_by(PolicyModel.updated_at.desc()).all()
        result = []
        for p in policies:
            active_ver = None
            if p.active_version_id:
                v = db.query(PolicyVersionModel).filter_by(id=p.active_version_id).first()
                if v:
                    active_ver = {
                        "id": v.id,
                        "version_num": v.version_num,
                        "prompt": v.prompt,
                        "risk_score": v.risk_score,
                        "risk_level": v.risk_level,
                        "ir": json.loads(v.ir_json),
                        "compiled_nft": v.compiled_nft,
                        "compiled_ipt": v.compiled_ipt,
                        "compiled_cisco": v.compiled_cisco,
                        "created_at": v.created_at.isoformat()
                    }
            result.append({
                "id": p.id,
                "name": p.name,
                "status": p.status,
                "active_version_id": p.active_version_id,
                "created_at": p.created_at.isoformat(),
                "updated_at": p.updated_at.isoformat(),
                "active_version": active_ver,
                "versions_count": len(p.versions)
            })
        return result


def get_audit_trail(limit: int = 50) -> List[Dict[str, Any]]:
    with SessionLocal() as db:
        events = db.query(AuditEventModel).order_by(AuditEventModel.created_at.desc()).limit(limit).all()
        return [
            {
                "id": e.id,
                "actor": e.actor,
                "action": e.action,
                "object_ref": e.object_ref,
                "payload": json.loads(e.payload_json),
                "created_at": e.created_at.isoformat()
            }
            for e in events
        ]
