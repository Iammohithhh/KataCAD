from fastapi import APIRouter, HTTPException

from app.lib.cadquery.base import bounding_box, export_step_b64
from app.lib.cadquery.registry import get_generator
from app.schemas.generate import ArchetypeMetadata, GenerateRequest, GenerateResponse

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
