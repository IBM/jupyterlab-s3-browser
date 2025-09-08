#!/bin/bash
# This script cleans and rebuilds the jupyterlab-s3-browser extension for JupyterLab 4

# Exit on error
set -e

# Clean up existing build artifacts
echo "Cleaning up..."
rm -rf node_modules
rm -rf lib
rm -rf jupyterlab_s3_browser/labextension
rm -f tsconfig.tsbuildinfo
rm -rf build
rm -rf dist
rm -rf *.egg-info

# Install dependencies
echo "Installing dependencies..."
jlpm install

# Build the extension
echo "Building extension..."
jlpm build:prod

# Install the Python package
echo "Installing Python package..."
pip install -e .

echo "Build complete! You can now start JupyterLab with 'jupyter lab'"
