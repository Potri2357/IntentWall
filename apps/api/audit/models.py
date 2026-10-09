"""
Database Models for Audit Trail, Policy Versions, and Simulation History
"""

import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class PolicyModel(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    status = Column(String, default="draft")  # draft, simulated, approved, applied, rolled_back
    active_version_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("PolicyVersionModel", back_populates="policy", cascade="all, delete-orphan")


class PolicyVersionModel(Base):
    __tablename__ = "policy_versions"

    id = Column(String, primary_key=True)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    version_num = Column(Integer, default=1)
    prompt = Column(Text, nullable=False)
    model_name = Column(String, default="deterministic-parser")
    ir_json = Column(Text, nullable=False)
    compiled_nft = Column(Text, nullable=False)
    compiled_ipt = Column(Text, nullable=False)
    compiled_cisco = Column(Text, nullable=False)
    risk_score = Column(Integer, default=10)
    risk_level = Column(String, default="low")
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("PolicyModel", back_populates="versions")
    simulations = relationship("SimulationRunModel", back_populates="version", cascade="all, delete-orphan")


class SimulationRunModel(Base):
    __tablename__ = "simulation_runs"

    id = Column(String, primary_key=True)
    version_id = Column(String, ForeignKey("policy_versions.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    passed_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    status = Column(String, default="completed")  # running, completed, failed
    results_json = Column(Text, default="[]")

    version = relationship("PolicyVersionModel", back_populates="simulations")


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True)
    actor = Column(String, default="admin (local)")
    action = Column(String, nullable=False)  # parse, simulate, approve, apply, rollback
    object_ref = Column(String, nullable=False)
    payload_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
