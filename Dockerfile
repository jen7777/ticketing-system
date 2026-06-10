FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build


FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend backend
COPY scripts scripts
COPY --from=frontend-build /app/frontend/dist frontend/dist

RUN mkdir -p backend/data

EXPOSE 5001

CMD ["sh", "-c", "python scripts/init_db.py && python backend/api.py"]
