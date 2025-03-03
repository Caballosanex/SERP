FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Puerto para la API del microservicio
EXPOSE 5002

# Comando para iniciar el servicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5002", "--reload"]
