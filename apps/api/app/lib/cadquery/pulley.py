"""Layer 2 archetype — V-groove pulley."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    outer_d = clamp(param(params, "outer_diameter", 100), 40, 240)
    width = clamp(param(params, "width", 30), 12, 80)
    outer_r = outer_d / 2
    bore_d = clamp(param(params, "bore_diameter", 20), 6, outer_d - 30)
    bore_r = bore_d / 2
    groove_depth = clamp(param(params, "groove_depth", 12), 4, outer_r - bore_r - 6)

    # Half cross-section: local U = radius, local V = position across the width.
    # Revolved about local V (= global Z), the notch on the rim is the V-groove.
    profile = [
        (bore_r, 0),
        (outer_r, 0),
        (outer_r, width * 0.32),
        (outer_r - groove_depth, width * 0.5),
        (outer_r, width * 0.68),
        (outer_r, width),
        (bore_r, width),
    ]
    model = cq.Workplane("XZ").polyline(profile).close().revolve(360, (0, 0, 0), (0, 1, 0))

    return ArchetypeBuild(
        model=model,
        label="V-Groove Pulley",
        semantic_tree=feature(
            "pulley",
            feature("rim"),
            feature("v_groove"),
            feature("bore"),
        ),
        sliders=[
            slider("outer_diameter", "Outer diameter (mm)", 40, 240, 2),
            slider("width", "Width (mm)", 12, 80, 1),
            slider("bore_diameter", "Bore diameter (mm)", 6, 120, 1),
            slider("groove_depth", "Groove depth (mm)", 4, 40, 1),
        ],
    )
