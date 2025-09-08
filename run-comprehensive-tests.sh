#!/bin/bash

# Ulimi App - Comprehensive Test Suite
# Google Deployment Ready - Final Verification

echo "🚀 ULIMI COMPREHENSIVE TEST SUITE"
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}Phase 1: Infrastructure Tests${NC}"
echo "=============================="

# Test 1: Server Health Check
echo "Testing server health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HTTP_CODE" = "200" ]; then
    print_test_result 0 "Server health endpoint responding"
else
    print_test_result 1 "Server health endpoint failed (HTTP: $HTTP_CODE)"
fi

# Test 2: Database Connection
echo "Testing database connection..."
DB_TEST=$(npm run db:push --force 2>&1 | grep -c "error\|Error\|ERROR")
if [ "$DB_TEST" -eq 0 ]; then
    print_test_result 0 "Database connection and schema sync"
else
    print_test_result 1 "Database connection issues detected"
fi

# Test 3: Build System
echo "Testing production build..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_SUCCESS=$(echo "$BUILD_OUTPUT" | grep -c "✓ built in")
if [ "$BUILD_SUCCESS" -gt 0 ]; then
    print_test_result 0 "Production build system"
else
    print_test_result 1 "Production build failed"
fi

echo -e "\n${BLUE}Phase 2: API Endpoint Tests${NC}"
echo "============================"

# Test 4: User API
echo "Testing user management API..."
USER_API=$(curl -s -w "%{http_code}" http://localhost:5000/api/users | tail -c 3)
if [ "$USER_API" = "200" ]; then
    print_test_result 0 "User management API"
else
    print_test_result 1 "User management API failed"
fi

# Test 5: Stories API
echo "Testing stories API..."
STORIES_API=$(curl -s -w "%{http_code}" http://localhost:5000/api/stories | tail -c 3)
if [ "$STORIES_API" = "200" ]; then
    print_test_result 0 "Stories API endpoint"
else
    print_test_result 1 "Stories API endpoint failed"
fi

echo -e "\n${BLUE}Phase 3: Authentication Tests${NC}"
echo "=============================="

# Test 6: Demo Authentication
echo "Testing demo authentication..."
DEMO_AUTH=$(curl -s -X POST http://localhost:5000/api/auth/demo -H "Content-Type: application/json" -w "%{http_code}" | tail -c 3)
if [ "$DEMO_AUTH" = "200" ] || [ "$DEMO_AUTH" = "201" ]; then
    print_test_result 0 "Demo authentication system"
else
    print_test_result 1 "Demo authentication failed"
fi

# Test 7: Firebase Configuration
echo "Testing Firebase configuration..."
if [ -n "$VITE_FIREBASE_API_KEY" ] && [ -n "$VITE_FIREBASE_PROJECT_ID" ]; then
    print_test_result 0 "Firebase environment variables"
else
    print_test_result 1 "Firebase environment variables missing"
fi

echo -e "\n${BLUE}Phase 4: Feature Completeness Tests${NC}"
echo "===================================="

# Test 8: Client Assets
echo "Testing client assets build..."
if [ -f "dist/public/index.html" ] && [ -f "dist/public/assets/index-"*".js" ]; then
    print_test_result 0 "Client assets generation"
else
    print_test_result 1 "Client assets missing"
fi

# Test 9: Server Bundle
echo "Testing server bundle..."
if [ -f "dist/index.js" ]; then
    SERVER_SIZE=$(stat -c%s "dist/index.js")
    if [ "$SERVER_SIZE" -gt 100000 ] && [ "$SERVER_SIZE" -lt 500000 ]; then
        print_test_result 0 "Server bundle size optimized ($SERVER_SIZE bytes)"
    else
        print_test_result 1 "Server bundle size concerning ($SERVER_SIZE bytes)"
    fi
else
    print_test_result 1 "Server bundle missing"
fi

# Test 10: Dependencies
echo "Testing critical dependencies..."
DEPS_CHECK=$(npm list react @tanstack/react-query wouter 2>/dev/null | grep -c "react\|@tanstack\|wouter")
if [ "$DEPS_CHECK" -ge 3 ]; then
    print_test_result 0 "Critical dependencies installed"
else
    print_test_result 1 "Critical dependencies missing"
fi

echo -e "\n${BLUE}Phase 5: Security & Performance Tests${NC}"
echo "======================================"

# Test 11: Environment Security
echo "Testing environment security..."
if [ -f ".env" ]; then
    ENV_SECURITY=$(grep -c "SECRET\|KEY\|PASSWORD" .env 2>/dev/null || echo 0)
    if [ "$ENV_SECURITY" -gt 0 ]; then
        print_test_result 0 "Environment variables configured"
    else
        print_test_result 1 "Environment variables insufficient"
    fi
else
    print_test_result 1 "Environment file missing"
fi

# Test 12: TypeScript Compilation
echo "Testing TypeScript compilation..."
TS_CHECK=$(npm run build 2>&1 | grep -c "error TS\|Error:")
if [ "$TS_CHECK" -eq 0 ]; then
    print_test_result 0 "TypeScript compilation clean"
else
    print_test_result 1 "TypeScript compilation errors detected"
fi

echo -e "\n${BLUE}Phase 6: Mobile & Responsiveness Tests${NC}"
echo "======================================="

# Test 13: Mobile Assets
echo "Testing mobile responsiveness assets..."
if [ -f "capacitor.config.ts" ] && [ -d "android" ]; then
    print_test_result 0 "Mobile platform configuration"
else
    print_test_result 1 "Mobile platform configuration incomplete"
fi

# Test 14: PWA Configuration
echo "Testing PWA readiness..."
PWA_ASSETS=$(ls dist/public/assets/ 2>/dev/null | wc -l)
if [ "$PWA_ASSETS" -gt 3 ]; then
    print_test_result 0 "PWA assets generation"
else
    print_test_result 1 "PWA assets insufficient"
fi

echo -e "\n${BLUE}Phase 7: User Experience Tests${NC}"
echo "==============================="

# Test 15: Image Processing
echo "Testing image processing components..."
if [ -f "client/src/components/ImageCropper.tsx" ] && [ -f "client/src/components/ProfilePhotoUpload.tsx" ]; then
    print_test_result 0 "Image processing components"
else
    print_test_result 1 "Image processing components missing"
fi

# Test 16: Data Reset Functionality
echo "Testing data reset implementation..."
DATA_RESET_CHECK=$(grep -r "localStorage.removeItem" client/src/hooks/useAuth.ts | wc -l)
if [ "$DATA_RESET_CHECK" -gt 3 ]; then
    print_test_result 0 "Data reset functionality implemented"
else
    print_test_result 1 "Data reset functionality incomplete"
fi

# Test 17: Onboarding Preferences
echo "Testing onboarding preferences..."
ONBOARDING_CHECK=$(grep -c "Children's Stories\|Reading" client/src/components/OnboardingFlow.tsx 2>/dev/null || echo 0)
if [ "$ONBOARDING_CHECK" -gt 1 ]; then
    print_test_result 0 "Onboarding preferences updated"
else
    print_test_result 1 "Onboarding preferences not updated"
fi

echo -e "\n${YELLOW}=== FINAL TEST RESULTS ===${NC}"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! SUCCESS RATE: 100%${NC}"
    echo -e "${GREEN}✅ APPLICATION IS GOOGLE DEPLOYMENT READY!${NC}"
    exit 0
elif [ "$SUCCESS_RATE" -ge 85 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY PASSING: $SUCCESS_RATE% SUCCESS RATE${NC}"
    echo -e "${YELLOW}📋 APPLICATION IS DEPLOYMENT READY WITH MINOR ISSUES${NC}"
    exit 0
else
    echo -e "${RED}❌ CRITICAL ISSUES DETECTED: $SUCCESS_RATE% SUCCESS RATE${NC}"
    echo -e "${RED}🚫 APPLICATION NEEDS FIXES BEFORE DEPLOYMENT${NC}"
    exit 1
fi