"""Re-execute a retrieved part's CadQuery, scale it, and parse it for names.

The corpus CadQuery is curated (every part executed successfully when the
index was built), so `exec` here runs vetted code, never user input. Each
dataset script ends by assigning its final shape to a variable named `solid`.
"""

import re

import cadquery as cq

from app.schemas.generate import FeatureNode

# Largest dimension (mm) of a retrieved part at scale 1.0. DeepCAD coordinates
# are normalised to ~0-1, so retrieved parts must be scaled up to be usable.
BASE_TARGET_SIZE = 150.0


def try_execute(code: str) -> cq.Workplane | None:
    """Execute a dataset CadQuery script; return its `solid`, or None on failure."""
    namespace: dict = {}
    try:
        exec(code, namespace)
    except Exception:
        return None

    solid = namespace.get("solid")
    if not isinstance(solid, cq.Workplane):
        return None
    try:
        if not solid.vals():
            return None
    except Exception:
        return None
    return solid


def is_sane(solid: cq.Workplane) -> bool:
    """A part is usable if it is a real solid with proportionate extents."""
    try:
        box = solid.val().BoundingBox()
    except Exception:
        return False
    dims = sorted([box.xlen, box.ylen, box.zlen])
    if dims[0] <= 1e-6 or dims[2] <= 1e-6:
        return False
    # Reject needles and sheets — extreme aspect ratios render poorly.
    return dims[2] / dims[0] <= 40


def scaled_model(solid: cq.Workplane, target_size: float) -> cq.Workplane:
    """Scale a part so its largest dimension equals `target_size` (mm)."""
    box = solid.val().BoundingBox()
    largest = max(box.xlen, box.ylen, box.zlen, 1e-9)
    factor = target_size / largest
    return cq.Workplane().add(solid.val().scale(factor))


def semantic_tree(code: str) -> FeatureNode:
    """Parse retrieved CadQuery into a plausible feature tree."""
    sketches = sorted(set(re.findall(r"wp_sketch(\d+)", code)), key=int)
    bodies = sorted(set(re.findall(r"solid(\d+)\s*=", code)), key=int)

    children = [FeatureNode(name=f"profile_{s}") for s in sketches]
    children += [FeatureNode(name=f"body_{b}") for b in bodies]
    if "hole" in code.lower() or ".cut(" in code:
        children.append(FeatureNode(name="hole_array_0"))
    if not children:
        children = [FeatureNode(name="body_0")]

    return FeatureNode(name="generated_part", children=children)
