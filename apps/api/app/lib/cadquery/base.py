"""Shared helpers for the Layer 2 CadQuery archetype generators.

Every archetype module exposes ``build(params) -> ArchetypeBuild``. The
endpoint exports the build's model to a STEP file and packages it with the
build's semantic tree and slider definitions.
"""

import base64
import tempfile
from dataclasses import dataclass
from pathlib import Path

import cadquery as cq
from cadquery import exporters

from app.schemas.generate import FeatureNode, SliderDef


@dataclass
class ArchetypeBuild:
    """The internal result of an archetype generator (not serialized directly)."""

    model: cq.Workplane
    label: str
    semantic_tree: FeatureNode
    sliders: list[SliderDef]


def param(params: dict[str, float], key: str, fallback: float) -> float:
    """Read a numeric parameter, falling back when it is missing or invalid."""
    value = params.get(key)
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return fallback


def clamp(value: float, low: float, high: float) -> float:
    """Constrain a value to [low, high] so geometry never degenerates."""
    return max(low, min(high, value))


def feature(name: str, *children: FeatureNode) -> FeatureNode:
    """Build a semantic feature-tree node."""
    return FeatureNode(name=name, children=list(children))


def slider(key: str, label: str, low: float, high: float, step: float) -> SliderDef:
    """Build a slider definition."""
    return SliderDef(key=key, label=label, min=low, max=high, step=step)


def export_step_b64(model: cq.Workplane) -> str:
    """Export a CadQuery model to a STEP file and return it base64-encoded."""
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "part.step"
        exporters.export(model, str(path), exportType="STEP")
        data = path.read_bytes()
    return base64.b64encode(data).decode("ascii")


def bounding_box(model: cq.Workplane) -> list[float]:
    """Return the [x, y, z] extents of a model's bounding box."""
    box = model.val().BoundingBox()
    return [round(box.xlen, 3), round(box.ylen, 3), round(box.zlen, 3)]
