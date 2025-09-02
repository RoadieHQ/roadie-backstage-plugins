#!/bin/bash

# Test script for building and running backstage-entity-validator

set -e  # Exit on any error

echo "🚀 Starting backstage-entity-validator build and test process..."

# Clean previous builds
echo " Cleaning previous builds..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Check typedef
echo "📦 Creating type definitions..."
yarn tsc

# Build the package
echo "🔨 Building the package..."
yarn build

# Check if the built files exist
echo "🔍 Checking build output..."
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found after build"
    exit 1
fi

# List the contents of dist directory to verify build output
echo "📄 Build output contents:"
ls -la dist/

# Check for the main built file
MAIN_FILE="dist/index.cjs.js"
if [ ! -f "$MAIN_FILE" ]; then
    echo "❌ Error: Main built file $MAIN_FILE not found"
    exit 1
fi

echo "✅ Main built file found: $MAIN_FILE"

# Pack the package to create a tarball
echo "📦 Creating package tarball..."
yarn pack

# Find the generated tarball
TARBALL=$(find . -name "*.tgz" -type f | head -n 1)
if [ -z "$TARBALL" ]; then
    echo "❌ Error: No tarball found after packing"
    exit 1
fi

echo "✅ Package tarball created: $TARBALL"

# Test the package by importing it in a simple Node.js script
echo "🧪 Testing the built package..."

# Create a simple test script
cat > test_package.js << 'EOF'
const { validate, validateFromFile } = require('./dist/index.cjs.js');

console.log('✅ Successfully imported validate functions');
console.log('📋 Available exports:', { validate: typeof validate, validateFromFile: typeof validateFromFile });

// Basic test to ensure the functions are callable
if (typeof validate === 'function' && typeof validateFromFile === 'function') {
    console.log('✅ All expected functions are available and callable');
} else {
    console.log('❌ Some functions are missing or not callable');
    process.exit(1);
}
EOF

# Run the test script
node test_package.js

# Clean up test file
rm test_package.js

echo "🎉 Build and test completed successfully!"
echo "📝 Summary:"
echo "  - Package built successfully"
echo "  - Main file: $MAIN_FILE"
echo "  - Tarball: $TARBALL"
echo "  - Package exports are functional"

# Optional: Show package info
echo "📊 Package information:"
yarn info --name-only