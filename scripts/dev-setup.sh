#!/bin/bash
# scripts/dev-setup.sh - Script de configuración para desarrollo

echo "🚀 Configurando entorno de desarrollo..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edita .env con tus credenciales"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear directorios necesarios
echo "📁 Creando estructura de directorios..."
mkdir -p dist public logs

# Configurar hooks de Git
echo "🔧 Configurando Git hooks..."
npx husky install

echo "✅ Configuración completada!"
echo ""
echo "Para iniciar el desarrollo:"
echo "  npm run dev"
echo ""
echo "Para ejecutar pruebas:"
echo "  npm test"