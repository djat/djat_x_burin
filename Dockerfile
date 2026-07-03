# Transect Trust — full stack (FastAPI + React static UI)
FROM node:22-alpine AS frontend
WORKDIR /build/transect-trust
COPY transect-trust/package.json transect-trust/package-lock.json* ./
RUN npm ci
COPY transect-trust/ ./
RUN npm run build

FROM python:3.12-slim AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY Burin /app/Burin
COPY burin-pathways /app/burin-pathways
COPY backend /app/backend
COPY --from=frontend /build/transect-trust/dist /app/static

RUN pip install --no-cache-dir pip setuptools wheel \
    && pip install --no-cache-dir /app/Burin \
    && pip install --no-cache-dir /app/backend

ENV DATABASE_URL=sqlite:////data/presence_passport.db
ENV STATIC_DIR=/app/static
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
