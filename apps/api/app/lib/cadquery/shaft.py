"""Layer 2 archetype — stepped shaft."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    diameter = clamp(param(params, "diameter", 30), 8, 90)
    length = clamp(param(params, "length", 150), 40, 360)
    step_diameter = clamp(param(params, "step_diameter", 20), 5, diameter - 2)
    step_length = clamp(param(params, "step_length", 45), 10, length - 15)
    chamfer = clamp(param(params, "chamfer", 1.6), 0.5, min(step_diameter, diameter) / 4)

    # Main journal, then a narrower step extruded from its top face.
    model = cq.Workplane("XY").circle(diameter / 2).extrude(length - step_length)
    model = model.faces(">Z").workplane().circle(step_diameter / 2).extrude(step_length)

    # Ease the two end faces.
    model = model.faces(">Z").edges().chamfer(chamfer)
    model = model.faces("<Z").edges().chamfer(chamfer)

    return ArchetypeBuild(
        model=model,
        label="Stepped Shaft",
        semantic_tree=feature(
            "shaft",
            feature("main_journal"),
            feature("step"),
            feature("end_chamfers"),
        ),
        sliders=[
            slider("diameter", "Main diameter (mm)", 8, 90, 1),
            slider("length", "Total length (mm)", 40, 360, 2),
            slider("step_diameter", "Step diameter (mm)", 5, 88, 1),
            slider("step_length", "Step length (mm)", 10, 200, 2),
        ],
    )
