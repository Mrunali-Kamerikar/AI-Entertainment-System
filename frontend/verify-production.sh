#!/bin/bash

# ============================================
# CineVerse Production Verification Script
# ============================================
# Checks if the app is production-ready
# ============================================

set -e

echo "🔍 CineVerse Production Verification"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo -e "${BLUE}📋 Checking Files...${NC}"
echo ""

# Check required files exist
if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
else
    check_fail ".env.example missing"
fi

if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile exists"
else
    check_fail "Dockerfile missing"
fi

if [ -f "docker-compose.yml" ]; then
    check_pass "docker-compose.yml exists"
else
    check_fail "docker-compose.yml missing"
fi

if [ -f "nginx.conf" ]; then
    check_pass "nginx.conf exists"
else
    check_fail "nginx.conf missing"
fi

if [ -f "src/app/config/env.ts" ]; then
    check_pass "Environment config exists"
else
    check_fail "Environment config missing"
fi

echo ""
echo -e "${BLUE}🔐 Checking Environment Setup...${NC}"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    check_pass ".env file exists"

    # Check if it has required variables
    if grep -q "VITE_TMDB_API_KEY" .env; then
        check_pass ".env contains TMDB API key"
    else
        check_fail ".env missing TMDB API key"
    fi

    if grep -q "VITE_GEMINI_API_KEY" .env; then
        check_pass ".env contains Gemini API key"
    else
        check_warn ".env missing Gemini API key (chatbot won't work)"
    fi
else
    check_warn ".env file not found (will use defaults from .env.example)"
    echo -e "         Run: ${BLUE}cp .env.example .env${NC} and edit with your keys"
fi

echo ""
echo -e "${BLUE}🔍 Checking Code Quality...${NC}"
echo ""

# Check for hardcoded localhost in services (should be in config only)
LOCALHOST_COUNT=$(find src/app/services -name "*.ts" -o -name "*.tsx" | xargs grep -c "localhost" 2>/dev/null || echo "0")
if [ "$LOCALHOST_COUNT" -eq "0" ]; then
    check_pass "No hardcoded localhost in services"
else
    check_warn "Found $LOCALHOST_COUNT localhost references in services"
fi

# Check if gitignore excludes .env
if grep -q "^\.env$" .gitignore; then
    check_pass ".env is in .gitignore"
else
    check_fail ".env not in .gitignore (security risk!)"
fi

echo ""
echo -e "${BLUE}🐳 Checking Docker Setup...${NC}"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    check_pass "Docker is installed"
else
    check_warn "Docker not installed (required for containerized deployment)"
fi

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    check_pass "Docker Compose is installed"
else
    check_warn "Docker Compose not installed (required for easy deployment)"
fi

echo ""
echo -e "${BLUE}📦 Checking Dependencies...${NC}"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_warn "Dependencies not installed. Run: pnpm install"
fi

# Check if package.json has required scripts
if grep -q "\"build\"" package.json; then
    check_pass "Build script exists"
else
    check_fail "Build script missing in package.json"
fi

echo ""
echo -e "${BLUE}📚 Checking Documentation...${NC}"
echo ""

DOCS=(
    "PRODUCTION_DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "ENVIRONMENT_GUIDE.md"
    "PRODUCTION_READY_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc missing"
    fi
done

echo ""
echo "====================================="
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo "====================================="
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 CineVerse is PRODUCTION READY!${NC}"
    echo ""
    echo "Next steps:"
    echo -e "  1. ${BLUE}cp .env.example .env${NC} (if not done)"
    echo -e "  2. ${BLUE}nano .env${NC} (add your API keys)"
    echo -e "  3. ${BLUE}docker-compose up -d${NC} (deploy)"
    echo -e "  4. ${BLUE}Open http://localhost${NC} in browser"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review above.${NC}"
    echo ""
    exit 1
fi
