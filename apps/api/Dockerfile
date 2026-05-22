FROM python:3.11-slim

# CadQuery's OCCT bindings (used Phase 5+) need these system libraries.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

COPY app/ ./app/
# Layer 3 retrieval needs the FAISS index + parts list at runtime. The path
# `apps/api/index/` is resolved by app.lib.retrieval.index at runtime; copy
# the folder into the image so the index ships with the API.
COPY index/ ./index/

# Pre-download the CLIP retrieval model into the image so the first Layer 3
# call is instant and the booth never depends on HuggingFace at request time.
# `|| echo` keeps the build green if the model server is unreachable —
# sentence-transformers will then fall back to a runtime download.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('clip-ViT-B-32')" \
    || echo "(CLIP pre-download failed at build time; will fall back to runtime download)"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
