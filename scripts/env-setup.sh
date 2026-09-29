#!/bin/bash

# Quick script to switch between local and production environment variables

case "${1:-help}" in
  local)
    echo "🔧 Switching to LOCAL environment..."
    cp .env.local .env
    echo "✅ Using .env.local (local database, localhost:3000)"
    ;;
  prod)
    echo "🔧 Switching to PRODUCTION environment..."
    cp .env.production .env
    echo "✅ Using .env.production (Supabase, production URL)"
    echo "💡 Copy these to Vercel → Settings → Environment Variables"
    ;;
  show-prod)
    echo "📋 Production environment variables (for Vercel):"
    echo "================================================"
    cat .env.production
    ;;
  *)
    echo "Usage: npm run env <local|prod|show-prod>"
    echo ""
    echo "  npm run env local      → Use local development (.env.local)"
    echo "  npm run env prod       → Use production (.env.production)"
    echo "  npm run env show-prod  → Display production variables for Vercel"
    ;;
esac
