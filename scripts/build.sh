#!/bin/bash
# scripts/build.sh - Script de build para producción

echo "🏗️  Construyendo para producción..."

# Limpiar dist
rm -rf dist

# Crear directorios
mkdir -p dist/frontend dist/backend

# Copiar frontend
cp -r src/frontend/* dist/frontend/

# Copiar backend
cp -r src/backend/* dist/backend/
cp package.json dist/
cp package-lock.json dist/

# Optimizar para producción
cd dist
npm ci --only=production

echo "✅ Build completado en dist/"