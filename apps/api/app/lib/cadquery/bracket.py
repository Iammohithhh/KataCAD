"""Layer 2 archetype — L-bracket."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    length = clamp(param(params, "length", 80), 40, 180)
    height = clamp(param(params, "height", 60), 30, 160)
    width = clamp(param(params, "width", 44), 24, 90)
    thickness = clamp(param(params, "thickness", 6), 3, 16)
    hole_d = clamp(param(params, "hole_diameter", 8), 3, min(width, thickness * 2))
    hole_r = hole_d / 2

    # L-shape from two corner-anchored boxes (centered in Y).
    foot = (
        cq.Workplane("XY").box(length, width, thickness).translate((length / 2, 0, thickness / 2))
    )
    upstand = (
        cq.Workplane("XY").box(thickness, width, height).translate((thickness / 2, 0, height / 2))
    )
    model = foot.union(upstand)

    # One mounting hole through each leg.
    foot_hole = cq.Solid.makeCylinder(
        hole_r, thickness + 4, cq.Vector(length - thickness - hole_r - 8, 0, -2), cq.Vector(0, 0, 1)
    )
    upstand_hole = cq.Solid.makeCylinder(
        hole_r, thickness + 4, cq.Vector(-2, 0, height - thickness - hole_r - 8), cq.Vector(1, 0, 0)
    )
    model = model.cut(foot_hole).cut(upstand_hole)

    return ArchetypeBuild(
        model=model,
        label="L-Bracket",
        semantic_tree=feature(
            "bracket",
            feature("foot"),
            feature("upstand"),
            feature("mounting_holes"),
        ),
        sliders=[
            slider("length", "Length (mm)", 40, 180, 1),
            slider("height", "Height (mm)", 30, 160, 1),
            slider("width", "Width (mm)", 24, 90, 1),
            slider("thickness", "Thickness (mm)", 3, 16, 0.5),
        ],
    )
