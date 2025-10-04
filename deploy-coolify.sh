#!/bin/bash

# Apex Performance - Coolify Deployment Script
# This script helps deploy the full-stack application to Coolify

set -e

echo "🚀 Apex Performance - Coolify Deployment"
echo "========================================"

# Check if docker and docker-compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f ".env.production" ]; then
    echo "📄 Loading production environment variables..."
    export $(grep -v '^#' .env.production | xargs)
else
    echo "⚠️  .env.production file not found. Using default values."
fi

# Generate secure secrets if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "🔐 Generated JWT_SECRET: $JWT_SECRET"
fi

if [ -z "$SECRET_KEY_BASE" ]; then
    SECRET_KEY_BASE=$(openssl rand -base64 32)
    echo "🔐 Generated SECRET_KEY_BASE: $SECRET_KEY_BASE"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p supabase/migrations
mkdir -p supabase/seed
mkdir -p logs

# Build the web application
echo "🔨 Building web application..."
docker build -f Dockerfile.web -t apex-performance-web:latest .

# Start the services
echo "🐳 Starting services with Docker Compose..."
docker-compose -f coolify-deployment.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check database
if docker-compose -f coolify-deployment.yml exec -T db pg_isready -U postgres -d postgres; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not healthy"
    exit 1
fi

# Check REST API
if curl -f http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
    echo "✅ REST API is healthy"
else
    echo "❌ REST API is not healthy"
fi

# Check web application
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Web application is healthy"
else
    echo "❌ Web application is not healthy"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service URLs:"
echo "   Web Application: http://localhost:3000"
echo "   Supabase REST API: http://localhost:54321"
echo "   Supabase Auth: http://localhost:54322"
echo "   Supabase Storage: http://localhost:54323"
echo "   Supabase Realtime: http://localhost:54324"
echo "   Supabase Studio: http://localhost:54325"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose -f coolify-deployment.yml logs -f"
echo "   Stop services: docker-compose -f coolify-deployment.yml down"
echo "   Restart services: docker-compose -f coolify-deployment.yml restart"
echo ""
echo "⚠️  Remember to:"
echo "   1. Update your DNS to point to your Coolify server"
echo "   2. Configure SSL certificates"
echo "   3. Update environment variables for production URLs"
echo "   4. Set up monitoring and backups"