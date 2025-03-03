# ./backend/Dockerfile
FROM python:3.11-rc-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
	gcc \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install --no-compile --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]