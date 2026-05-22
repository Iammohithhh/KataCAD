"""Schemas for the Layer 2 archetype generation endpoint."""

from pydantic import BaseModel, Field


class FeatureNode(BaseModel):
    """A node in an archetype's semantic feature tree."""

    name: str
    children: list["FeatureNode"] = Field(default_factory=list)


class SliderDef(BaseModel):
    """A parameter-slider definition for an archetype."""

    key: str
    label: str
    min: float
    max: float
    step: float


class ArchetypeMetadata(BaseModel):
    """Everything the web needs to present a generated archetype."""

    archetype: str
    label: str
    semantic_tree: FeatureNode
    sliders: list[SliderDef]
    bounding_box: list[float]


class GenerateRequest(BaseModel):
    """A request to generate one Layer 2 archetype."""

    archetype: str
    params: dict[str, float] = Field(default_factory=dict)


class Layer3Request(BaseModel):
    """A request to retrieve a Layer 3 part for a prompt."""

    prompt: str
    params: dict[str, float] = Field(default_factory=dict)


class GenerateResponse(BaseModel):
    """A generated archetype: a base64 STEP file plus its metadata."""

    step_b64: str
    metadata: ArchetypeMetadata


FeatureNode.model_rebuild()
