"""Layer 2 archetype — split-ring clamp."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    inner_d = clamp(param(params, "inner_diameter", 44), 16, 130)
    wall = clamp(param(params, "wall_thickness", 10), 5, 26)
    width = clamp(param(params, "width", 28), 14, 60)
    bolt_d = clamp(param(params, "bolt_diameter", 8), 4, 16)

    inner_r = inner_d / 2
    outer_r = inner_r + wall
    gap_w = clamp(param(params, "gap", 6), 4, wall * 1.4)
    lug_w = wall * 1.7
    lug_reach = wall * 2.6

    # Annular ring.
    model = cq.Workplane("XY").circle(outer_r).circle(inner_r).extrude(width)

    # Two bolt lugs at the top (+Y), flanking the future split.
    lug_y = outer_r + lug_reach / 2 - 4
    lug = cq.Workplane("XY").box(lug_w, lug_reach + 8, width)
    model = model.union(lug.translate((-(gap_w / 2 + lug_w / 2), lug_y, width / 2)))
    model = model.union(lug.translate((gap_w / 2 + lug_w / 2, lug_y, width / 2)))

    # Cut the split: a narrow slot through the top wall and between the lugs.
    slot_span = outer_r + lug_reach + 16
    gap = (
        cq.Workplane("XY")
        .box(gap_w, slot_span, width + 4)
        .translate((0, slot_span / 2 - 5, width / 2))
    )
    model = model.cut(gap)

    # Bolt hole across the lugs.
    bolt = cq.Solid.makeCylinder(
        bolt_d / 2,
        lug_w * 2 + gap_w + 10,
        cq.Vector(-(lug_w + gap_w / 2 + 5), lug_y, width / 2),
        cq.Vector(1, 0, 0),
    )
    model = model.cut(bolt)

    return ArchetypeBuild(
        model=model,
        label="Split-Ring Clamp",
        semantic_tree=feature(
            "clamp",
            feature("ring"),
            feature("bolt_lugs"),
            feature("split"),
        ),
        sliders=[
            slider("inner_diameter", "Inner diameter (mm)", 16, 130, 1),
            slider("wall_thickness", "Wall thickness (mm)", 5, 26, 0.5),
            slider("width", "Width (mm)", 14, 60, 1),
            slider("bolt_diameter", "Bolt diameter (mm)", 4, 16, 0.5),
        ],
    )
