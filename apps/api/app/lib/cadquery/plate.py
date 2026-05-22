"""Layer 2 archetype — mounting plate with corner holes."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    length = clamp(param(params, "length", 140), 50, 320)
    width = clamp(param(params, "width", 90), 40, 240)
    thickness = clamp(param(params, "thickness", 8), 3, 24)
    hole_d = clamp(param(params, "hole_diameter", 9), 3, 24)
    inset = clamp(
        param(params, "corner_inset", 15),
        hole_d / 2 + 3,
        min(length, width) / 2 - hole_d / 2 - 2,
    )

    model = cq.Workplane("XY").box(length, width, thickness).translate((0, 0, thickness / 2))

    corners = [
        (length / 2 - inset, width / 2 - inset),
        (length / 2 - inset, -(width / 2 - inset)),
        (-(length / 2 - inset), width / 2 - inset),
        (-(length / 2 - inset), -(width / 2 - inset)),
    ]
    model = model.faces(">Z").workplane().pushPoints(corners).hole(hole_d)

    return ArchetypeBuild(
        model=model,
        label="Mounting Plate",
        semantic_tree=feature(
            "plate",
            feature("body"),
            feature("corner_holes"),
        ),
        sliders=[
            slider("length", "Length (mm)", 50, 320, 2),
            slider("width", "Width (mm)", 40, 240, 2),
            slider("thickness", "Thickness (mm)", 3, 24, 0.5),
            slider("hole_diameter", "Hole diameter (mm)", 3, 24, 0.5),
        ],
    )
