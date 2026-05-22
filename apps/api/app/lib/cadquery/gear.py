"""Layer 2 archetype — spur gear."""

import math

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider

# Angular stations within one tooth period: (fraction of period, "root"/"tip").
_TOOTH = [(0.0, "root"), (0.2, "root"), (0.32, "tip"), (0.68, "tip"), (0.8, "root")]


def build(params: dict[str, float]) -> ArchetypeBuild:
    teeth = int(clamp(round(param(params, "teeth", 20)), 8, 60))
    module = clamp(param(params, "module", 4), 1.5, 8)
    thickness = clamp(param(params, "thickness", 12), 4, 40)

    pitch_r = module * teeth / 2
    tip_r = pitch_r + module
    root_r = pitch_r - 1.25 * module
    bore_d = clamp(param(params, "bore_diameter", 14), 4, root_r * 1.2)

    # Toothed outline as a closed polyline.
    points: list[tuple[float, float]] = []
    for i in range(teeth):
        for fraction, which in _TOOTH:
            angle = 2 * math.pi * (i + fraction) / teeth
            radius = tip_r if which == "tip" else root_r
            points.append((radius * math.cos(angle), radius * math.sin(angle)))

    model = cq.Workplane("XY").polyline(points).close().extrude(thickness)
    model = model.faces(">Z").workplane().circle(bore_d / 2).cutThruAll()

    return ArchetypeBuild(
        model=model,
        label="Spur Gear",
        semantic_tree=feature(
            "gear",
            feature("gear_body"),
            feature("teeth"),
            feature("bore"),
        ),
        sliders=[
            slider("teeth", "Tooth count", 8, 60, 1),
            slider("module", "Module (mm)", 1.5, 8, 0.5),
            slider("thickness", "Thickness (mm)", 4, 40, 1),
            slider("bore_diameter", "Bore diameter (mm)", 4, 60, 1),
        ],
    )
