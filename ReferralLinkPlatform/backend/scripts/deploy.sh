#!/bin/bash

# ReferralLink Platform - Production Deployment Script
# This script handles deployment to various platforms

set -e  # Exit on error

echo "🚀 ReferralLink Platform Deployment Script"
echo "=========================================="

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | xargs)
    echo "✅ Production environment loaded"
else
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production settings"
    exit 1
fi

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Deploy
    railway up
    
    echo "✅ Deployed to Railway successfully!"
    echo "Visit your Railway dashboard to view the deployment"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Build the project
    npm run build
    
    # Deploy
    vercel --prod
    
    echo "✅ Deployed to Vercel successfully!"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "📦 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not installed!"
        echo "Please install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Create app if it doesn't exist
    if ! heroku apps:info --app referrallink-backend &> /dev/null; then
        echo "Creating Heroku app..."
        heroku create referrallink-backend
    fi
    
    # Set environment variables
    echo "Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set SUPABASE_URL=$SUPABASE_URL
    heroku config:set SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
    heroku config:set SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
    heroku config:set OPENAI_API_KEY=$OPENAI_API_KEY
    heroku config:set COMPANY_URL=$COMPANY_URL
    
    # Deploy
    git push heroku main
    
    echo "✅ Deployed to Heroku successfully!"
    heroku logs --tail
}

# Function to deploy with Docker
deploy_docker() {
    echo "📦 Building Docker image..."
    
    # Build the image
    docker build -t referrallink-backend .
    
    # Tag for registry (update with your registry)
    docker tag referrallink-backend:latest your-registry/referrallink-backend:latest
    
    echo "📤 Pushing to registry..."
    docker push your-registry/referrallink-backend:latest
    
    echo "✅ Docker image built and pushed successfully!"
    echo "Deploy the image to your container service"
}

# Function to run pre-deployment checks
pre_deploy_checks() {
    echo "🔍 Running pre-deployment checks..."
    
    # Run tests
    echo "Running tests..."
    npm test
    
    # Check TypeScript compilation
    echo "Checking TypeScript..."
    npm run typecheck
    
    # Run linter
    echo "Running linter..."
    npm run lint || true  # Don't fail on lint warnings
    
    echo "✅ Pre-deployment checks passed!"
}

# Function to run post-deployment tasks
post_deploy_tasks() {
    echo "📋 Running post-deployment tasks..."
    
    # Test the deployment
    echo "Testing deployment health..."
    HEALTH_URL="${BASE_URL:-https://your-domain.com}/health"
    
    if curl -f $HEALTH_URL &> /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed or not accessible"
    fi
    
    # Notify team (optional)
    echo "📧 Deployment complete!"
    echo "Deployed at: $(date)"
}

# Main deployment flow
main() {
    # Select deployment platform
    echo ""
    echo "Select deployment platform:"
    echo "1) Railway"
    echo "2) Vercel"
    echo "3) Heroku"
    echo "4) Docker"
    echo "5) Run pre-deploy checks only"
    echo ""
    read -p "Enter choice [1-5]: " choice
    
    # Run pre-deployment checks
    pre_deploy_checks
    
    case $choice in
        1)
            deploy_railway
            ;;
        2)
            deploy_vercel
            ;;
        3)
            deploy_heroku
            ;;
        4)
            deploy_docker
            ;;
        5)
            echo "Pre-deployment checks complete. Exiting."
            exit 0
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    # Run post-deployment tasks
    post_deploy_tasks
    
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Verify the deployment at your platform's dashboard"
    echo "2. Test all critical features"
    echo "3. Monitor logs for any issues"
    echo "4. Update DNS if needed"
}

# Run main function
main