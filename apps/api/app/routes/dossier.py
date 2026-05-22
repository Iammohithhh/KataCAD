from fastapi import APIRouter

from app.lib.dossier import analyze
from app.schemas.dossier import DossierAnalysis, DossierRequest

router = APIRouter()


@router.post("/dossier/analysis", response_model=DossierAnalysis)
def dossier_analysis(request: DossierRequest) -> DossierAnalysis:
    """Pick a material and write manufacturing notes for a part. Always 200."""
    return analyze(request)
