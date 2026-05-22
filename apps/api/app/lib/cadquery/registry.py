"""Registry mapping archetype names to their CadQuery generators."""

from collections.abc import Callable

from app.lib.cadquery import (
    bracket,
    clamp,
    flange,
    gear,
    housing,
    hub,
    manifold,
    plate,
    pulley,
    shaft,
)
from app.lib.cadquery.base import ArchetypeBuild

Generator = Callable[[dict[str, float]], ArchetypeBuild]

ARCHETYPES: dict[str, Generator] = {
    "bracket": bracket.build,
    "flange": flange.build,
    "plate": plate.build,
    "shaft": shaft.build,
    "gear": gear.build,
    "housing": housing.build,
    "pulley": pulley.build,
    "hub": hub.build,
    "manifold": manifold.build,
    "clamp": clamp.build,
}


def get_generator(archetype: str) -> Generator | None:
    """Look up an archetype generator by name."""
    return ARCHETYPES.get(archetype)
