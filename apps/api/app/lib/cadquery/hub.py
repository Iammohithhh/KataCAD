"""Layer 2 archetype — flanged hub."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    flange_d = clamp(param(params, "flange_diameter", 96), 50, 220)
    hub_d = clamp(param(params, "hub_diameter", 44), 20, flange_d - 18)
    length = clamp(param(params, "length", 56), 24, 160)
    flange_t = clamp(param(params, "flange_thickness", 12), 5, 28)
    bore_d = clamp(param(params, "bore_diameter", 20), 6, hub_d - 8)
    bolt_d = clamp(param(params, "bolt_diameter", 9), 4, 16)
    bolt_count = int(clamp(round(param(params, "bolt_count", 5)), 3, 12))

    bolt_circle_r = clamp(
        (hub_d / 2 + flange_d / 2) / 2,
        hub_d / 2 + bolt_d / 2 + 3,
        flange_d / 2 - bolt_d / 2 - 3,
    )

    # Hub barrel standing on a flange disc, bored through, bolt holes in the flange.
    hub_barrel = cq.Workplane("XY").circle(hub_d / 2).extrude(length)
    flange = cq.Workplane("XY").circle(flange_d / 2).extrude(flange_t)
    model = hub_barrel.union(flange)
    model = model.faces(">Z").workplane().circle(bore_d / 2).cutThruAll()
    model = model.faces("<Z").workplane().polarArray(bolt_circle_r, 0, 360, bolt_count).hole(bolt_d)

    return ArchetypeBuild(
        model=model,
        label="Flanged Hub",
        semantic_tree=feature(
            "hub",
            feature("hub_body"),
            feature("flange"),
            feature("bolt_holes"),
            feature("bore"),
        ),
        sliders=[
            slider("flange_diameter", "Flange diameter (mm)", 50, 220, 2),
            slider("hub_diameter", "Hub diameter (mm)", 20, 200, 2),
            slider("length", "Hub length (mm)", 24, 160, 2),
            slider("bolt_count", "Bolt holes", 3, 12, 1),
        ],
    )
