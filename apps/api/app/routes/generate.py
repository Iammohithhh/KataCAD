from fastapi import APIRouter, HTTPException

from app.lib.cadquery.base import bounding_box, clamp, export_step_b64
from app.lib.cadquery.registry import get_generator
from app.lib.retrieval.executor import (
    BASE_TARGET_SIZE,
    is_sane,
    scaled_model,
    semantic_tree,
    try_execute,
)
from app.lib.retrieval.index import index_available, retrieve
from app.schemas.generate import (
    ArchetypeMetadata,
    GenerateRequest,
    GenerateResponse,
    Layer3Request,
    SliderDef,
)

router = APIRouter()


@router.post("/generate/layer2", response_model=GenerateResponse)
def generate_layer2(request: GenerateRequest) -> GenerateResponse:
    """Generate a Layer 2 archetype: returns a base64 STEP file plus metadata."""
    generator = get_generator(request.archetype)
    if generator is None:
        raise HTTPException(status_code=404, detail=f"Unknown archetype: {request.archetype}")

    try:
        build = generator(request.params)
        step_b64 = export_step_b64(build.model)
        box = bounding_box(build.model)
    except Exception as exc:  # generators clamp inputs; this is a genuine failure
        raise HTTPException(status_code=500, detail=f"Geometry generation failed: {exc}") from exc

    return GenerateResponse(
        step_b64=step_b64,
        metadata=ArchetypeMetadata(
            archetype=request.archetype,
            label=build.label,
            semantic_tree=build.semantic_tree,
            sliders=build.sliders,
            bounding_box=box,
        ),
    )


@router.post("/generate/layer3", response_model=GenerateResponse)
def generate_layer3(request: Layer3Request) -> GenerateResponse:
    """Retrieve the closest curated part for a prompt, re-execute, and serve it."""
    if not index_available():
        raise HTTPException(status_code=503, detail="Retrieval index is not built")

    candidates = retrieve(request.prompt, k=3)
    if not candidates:
        raise HTTPException(status_code=404, detail="No retrieval candidates found")

    scale = clamp(request.params.get("scale", 1.0) or 1.0, 0.3, 3.0)
    target_size = BASE_TARGET_SIZE * scale

    for part in candidates:
        try:
            solid = try_execute(part["cadquery"])
            if solid is None or not is_sane(solid):
                continue
            model = scaled_model(solid, target_size)
            step_b64 = export_step_b64(model)
            box = bounding_box(model)
        except Exception:
            continue

        return GenerateResponse(
            step_b64=step_b64,
            metadata=ArchetypeMetadata(
                archetype="generated",
                label="Generated Part",
                semantic_tree=semantic_tree(part["cadquery"]),
                sliders=[SliderDef(key="scale", label="Scale", min=0.3, max=3.0, step=0.1)],
                bounding_box=box,
            ),
        )

    raise HTTPException(status_code=500, detail="No retrieved candidate could be executed")
