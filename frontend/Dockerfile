FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Validate production build integrity
RUN npm run build

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080
ENV VITE_API_URL=http://localhost:3000/api/v1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

