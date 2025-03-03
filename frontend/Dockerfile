FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Puerto por defecto para la aplicación React
EXPOSE 3000

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "start"] 