"""Schemas for the dossier analysis endpoint."""

from pydantic import BaseModel, Field


class DossierRequest(BaseModel):
    """A part to analyze for the dossier."""

    prompt: str
    label: str
    dimensions: list[float] = Field(default_factory=list)
    faces: int = 0


class DossierAnalysis(BaseModel):
    """AI material selection and manufacturing notes for a part."""

    material_id: str
    material_reasoning: str
    manufacturing_notes: str
