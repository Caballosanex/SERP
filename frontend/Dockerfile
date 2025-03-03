# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json* ./

# Instalar dependencias y limpiar caché
RUN npm ci && \
    npm cache clean --force

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Production stage (opcional para entorno de desarrollo)
# Si solo necesitas el entorno de desarrollo, puedes eliminar esta etapa
# y usar directamente la imagen del builder
FROM node:20-alpine

WORKDIR /app

# Copiar solo los archivos necesarios
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

# Puerto para la aplicación React
EXPOSE 3000

# Comando para iniciar la aplicación 
CMD ["npm", "start"] 