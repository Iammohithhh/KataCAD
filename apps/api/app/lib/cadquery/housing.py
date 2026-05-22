"""Layer 2 archetype — open-top housing / enclosure."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    length = clamp(param(params, "length", 110), 50, 280)
    width = clamp(param(params, "width", 80), 40, 220)
    height = clamp(param(params, "height", 64), 30, 200)
    wall = clamp(param(params, "wall_thickness", 6), 2.5, min(length, width) / 4)
    bore_d = clamp(param(params, "bore_diameter", 30), 6, min(width, height) - 4 * wall)

    # Solid block, then a cavity cut from the top leaving four walls and a floor.
    model = cq.Workplane("XY").box(length, width, height).translate((0, 0, height / 2))
    cavity = (
        cq.Workplane("XY")
        .box(length - 2 * wall, width - 2 * wall, height)
        .translate((0, 0, height / 2 + wall))
    )
    model = model.cut(cavity)

    # A bore through the front wall.
    bore = cq.Solid.makeCylinder(
        bore_d / 2, width * 2, cq.Vector(0, -width, height * 0.5), cq.Vector(0, 1, 0)
    )
    model = model.cut(bore)

    return ArchetypeBuild(
        model=model,
        label="Housing",
        semantic_tree=feature(
            "housing",
            feature("shell"),
            feature("cavity"),
            feature("bore"),
        ),
        sliders=[
            slider("length", "Length (mm)", 50, 280, 2),
            slider("width", "Width (mm)", 40, 220, 2),
            slider("height", "Height (mm)", 30, 200, 2),
            slider("wall_thickness", "Wall thickness (mm)", 2.5, 16, 0.5),
        ],
    )
