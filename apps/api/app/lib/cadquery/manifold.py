"""Layer 2 archetype — hydraulic manifold block."""

import cadquery as cq

from app.lib.cadquery.base import ArchetypeBuild, clamp, feature, param, slider


def build(params: dict[str, float]) -> ArchetypeBuild:
    length = clamp(param(params, "length", 150), 60, 320)
    width = clamp(param(params, "width", 54), 30, 140)
    height = clamp(param(params, "height", 54), 30, 140)
    main_bore_d = clamp(param(params, "main_bore", 24), 8, min(width, height) - 14)
    port_d = clamp(param(params, "port_diameter", 14), 5, min(width, main_bore_d + 6))
    port_count = int(clamp(round(param(params, "port_count", 4)), 2, 9))

    # Solid block with a main bore running its length on the X axis.
    model = cq.Workplane("XY").box(length, width, height).translate((0, 0, height / 2))
    main = cq.Solid.makeCylinder(
        main_bore_d / 2, length * 2, cq.Vector(-length, 0, height * 0.5), cq.Vector(1, 0, 0)
    )
    model = model.cut(main)

    # Evenly spaced ports drilled down from the top into the main bore.
    for i in range(port_count):
        port_x = -length / 2 + length * (i + 0.5) / port_count
        port = cq.Solid.makeCylinder(
            port_d / 2, height * 0.85, cq.Vector(port_x, 0, height + 1), cq.Vector(0, 0, -1)
        )
        model = model.cut(port)

    return ArchetypeBuild(
        model=model,
        label="Hydraulic Manifold",
        semantic_tree=feature(
            "manifold",
            feature("block"),
            feature("main_bore"),
            feature("ports"),
        ),
        sliders=[
            slider("length", "Length (mm)", 60, 320, 2),
            slider("width", "Width (mm)", 30, 140, 2),
            slider("height", "Height (mm)", 30, 140, 2),
            slider("port_count", "Port count", 2, 9, 1),
        ],
    )
