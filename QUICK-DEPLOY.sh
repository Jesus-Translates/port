#!/bin/bash
set -e

echo "🚀 PORT Project - Vercel Deployment Script"
echo "=========================================="
echo ""
echo "This script will deploy PORT to Vercel automatically."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI (may require password for npm)..."
    npm install -g vercel
fi

echo ""
echo "📋 Enter your environment variables:"
echo ""

read -p "OpenAI API Key (sk-proj-...): " OPENAI_API_KEY
read -p "JWT Secret (press Enter for default): " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-SantaCruzSuperSecretKey2026}

read -p "Turnstile Site Key (press Enter for test): " TURNSTILE_SITE_KEY
TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY:-1x00000000000000000000AA}

read -p "Turnstile Secret Key (press Enter for test): " TURNSTILE_SECRET_KEY
TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY:-1x0000000000000000000000000000000AA}

echo ""
echo "🔐 Setting up environment variables..."

# Create .env.production.local for Vercel
cat > .env.production.local << EOF
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY
EOF

echo "✅ Environment variables saved"
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod \
  --env JWT_SECRET=$JWT_SECRET \
  --env OPENAI_API_KEY=$OPENAI_API_KEY \
  --env NEXT_PUBLIC_TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY \
  --env TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Your app is now live at the URL shown above."
echo ""
echo "📝 Next steps:"
echo "  1. Visit your Vercel project dashboard"
echo "  2. Test login with: Kelly / SantaCruz"
echo "  3. (Optional) Add custom domain: port.robertjeremiah.com"
echo ""
