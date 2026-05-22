"""Layer 2 archetype — bolted flange."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    outer_d = clamp(param(params, "outer_diameter", 120), 60, 260)
    thickness = clamp(param(params, "thickness", 10), 4, 30)
    bore_d = clamp(param(params, "bore_diameter", 40), 10, outer_d - 24)
    bolt_d = clamp(param(params, "bolt_diameter", 11), 4, 20)
    bolt_count = int(clamp(round(param(params, "bolt_count", 6)), 3, 16))

    outer_r = outer_d / 2
    # Keep the bolt circle between the bore and the rim, clear of both.
    bolt_circle_r = clamp(
        param(params, "bolt_circle", outer_d * 0.72) / 2,
        bore_d / 2 + bolt_d / 2 + 4,
        outer_r - bolt_d / 2 - 4,
    )

    model = cq.Workplane("XY").circle(outer_r).extrude(thickness)
    model = model.faces(">Z").workplane().circle(bore_d / 2).cutThruAll()
    model = model.faces(">Z").workplane().polarArray(bolt_circle_r, 0, 360, bolt_count).hole(bolt_d)

    return ArchetypeBuild(
        model=model,
        label="Flange",
        semantic_tree=feature(
            "flange",
            feature("disc"),
            feature("center_bore"),
            feature("bolt_holes"),
        ),
        sliders=[
            slider("outer_diameter", "Outer diameter (mm)", 60, 260, 2),
            slider("bore_diameter", "Bore diameter (mm)", 10, 200, 2),
            slider("thickness", "Thickness (mm)", 4, 30, 1),
            slider("bolt_count", "Bolt holes", 3, 16, 1),
            slider("bolt_circle", "Bolt circle (mm)", 50, 240, 2),
        ],
    )
