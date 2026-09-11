# Qalibrated backend API (Express + Prisma).
FROM node:20-alpine

WORKDIR /app

# Install dependencies (all deps — prisma CLI and tsx are needed at runtime for
# `prisma db push` and seeding on first boot).
COPY package*.json ./
RUN npm install

# Copy source and build (prisma generate + tsc).
COPY . .
RUN npm run build

# Runtime data locations (mounted as volumes in docker-compose for persistence).
RUN mkdir -p /app/data /app/uploads
ENV NODE_ENV=production

EXPOSE 5000

# Apply the schema, seed baseline data (idempotent), then start the built server.
CMD ["npm", "run", "start:prod"]
