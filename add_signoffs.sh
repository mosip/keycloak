#!/bin/bash

cd /home/bhuminathan/rapid-deployment/keycloak

# Get the commit before the first commit we want to squash (130 commits back)
BASE_COMMIT=$(git rev-parse HEAD~130)

echo "Starting squash of last 130 commits into one signed commit"
echo "Base commit: $BASE_COMMIT"

# Reset to the base commit but keep all changes in the working directory
echo "Resetting to base commit while keeping changes..."
git reset --soft $BASE_COMMIT

# Check status
echo "Current status after reset:"
git status --short

# Create a comprehensive commit message
COMMIT_MSG="feat: consolidated keycloak release updates

This commit consolidates multiple changes including:
- Keycloak configuration updates
- Theme and template improvements
- Deployment script enhancements
- Bug fixes and patches
- Version updates and dependency management

Squashed from 130 commits for cleaner history."

# Create one signed commit with all changes
echo "Creating signed commit..."
git commit -m "$COMMIT_MSG" --signoff

echo "Squash completed successfully!"
echo "Current commit:"
git log -1 --oneline

echo ""
echo "To push the changes, run:"
echo "git push --force-with-lease origin release-1.2.0.x"
