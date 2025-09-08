#!/bin/bash

# WADA BMAD Supabase Setup Script
# This script helps set up the Supabase backend for the WADA BMAD project

set -e

echo "🚀 WADA BMAD Supabase Setup"
echo "============================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null && ! command -v ./bin/supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   Option 1: npm install -g supabase"
    echo "   Option 2: Download from https://github.com/supabase/cli/releases"
    echo "   Option 3: Use Docker: docker run -it --rm supabase/supabase:latest"
    exit 1
fi

# Set supabase command path
if command -v ./bin/supabase &> /dev/null; then
    SUPABASE_CMD="./bin/supabase"
else
    SUPABASE_CMD="supabase"
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: Not in a git repository. Consider initializing git first."
fi

# Initialize Supabase if not already done (only for self-hosted)
if [ "$hosting_choice" = "2" ] && [ ! -f "supabase/config.toml" ]; then
    echo "📁 Initializing Supabase..."
    $SUPABASE_CMD init
elif [ "$hosting_choice" = "2" ]; then
    echo "✅ Supabase already initialized for self-hosting"
fi

# Ask user about hosting option
echo "🏠 Choose your Supabase hosting option:"
echo "   1. Cloud (supabase.com) - Recommended for production"
echo "   2. Self-hosted (local Docker) - For development/testing"
echo ""

read -p "Enter your choice (1 or 2): " hosting_choice

if [ "$hosting_choice" = "1" ]; then
    echo "☁️  Using Supabase Cloud"
    echo "🔗 Please ensure you have created a Supabase project at https://supabase.com"
    echo "   and updated the SUPABASE_URL and SUPABASE_ANON_KEY in your .env file"
    echo ""

    read -p "Have you created a Supabase project and updated your .env file? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please create a Supabase project first, then run this script again."
        exit 1
    fi

    # Link to remote project
    echo "🔗 Linking to remote Supabase project..."
    read -p "Enter your Supabase project reference ID: " project_ref

    if [ -n "$project_ref" ]; then
        $SUPABASE_CMD link --project-ref "$project_ref"
    else
        echo "⚠️  No project reference provided. You'll need to link manually."
    fi

elif [ "$hosting_choice" = "2" ]; then
    echo "🏠 Using Self-hosted Supabase"
    echo "🐳 Make sure Docker is running and you have sufficient resources"
    echo "📁 Using local configuration from supabase/config.toml"
    echo ""

    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi

else
    echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
    exit 1
fi

# Link to remote project
echo "🔗 Linking to remote Supabase project..."
read -p "Enter your Supabase project reference ID: " project_ref

if [ -n "$project_ref" ]; then
    supabase link --project-ref "$project_ref"
else
    echo "⚠️  No project reference provided. You'll need to link manually."
fi

# Start local development server (only for self-hosted)
if [ "$hosting_choice" = "2" ]; then
    echo "🖥️  Starting Supabase local development server..."
    $SUPABASE_CMD start

    # Apply migrations
    echo "🗃️  Applying database migrations..."
    $SUPABASE_CMD db push

    # Seed the database (optional)
    read -p "Would you like to seed the database with sample data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database with sample data..."
        $SUPABASE_CMD db reset
    fi
else
    echo "☁️  For cloud hosting, migrations are handled through the Supabase dashboard"
    echo "   or you can use: supabase db push --linked"
fi

echo ""
echo "✅ Supabase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the correct Supabase credentials"
echo "2. Test the connection by running your application"
echo "3. Check the Supabase dashboard for your data"
echo ""
echo "🔗 Useful links:"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- API Documentation: https://supabase.com/docs"
echo ""
echo "🎉 Happy coding!"