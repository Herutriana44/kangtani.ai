#!/bin/bash

# Kangtani.ai Backend API Test Script
# This script tests all API endpoints using curl

# Configuration
BASE_URL="http://localhost:8000"
TIMEOUT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️ $message${NC}"
            ;;
    esac
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    # Make request
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            --max-time $TIMEOUT \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            --max-time $TIMEOUT \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Parse response
    http_code=$(echo "$response" | tail -n 2 | head -n 1)
    response_time=$(echo "$response" | tail -n 1)
    response_body=$(echo "$response" | head -n -2)
    
    # Check status
    if [ "$http_code" -eq 200 ]; then
        print_status "SUCCESS" "HTTP $http_code (${response_time}s)"
        echo "Response: $response_body" | head -c 200
        if [ ${#response_body} -gt 200 ]; then
            echo "..."
        fi
    else
        print_status "ERROR" "HTTP $http_code (${response_time}s)"
        echo "Response: $response_body"
    fi
    
    echo "---"
}

# Function to test health endpoints
test_health_endpoints() {
    echo -e "\n${YELLOW}=== Health & Status Endpoints ===${NC}"
    
    test_endpoint "GET" "/" "" "Root endpoint"
    test_endpoint "GET" "/health" "" "Health check"
    test_endpoint "GET" "/debug" "" "Debug information"
}

# Function to test chat endpoints
test_chat_endpoints() {
    echo -e "\n${YELLOW}=== Chat API Endpoints ===${NC}"
    
    # Basic chat
    test_endpoint "POST" "/chat" '{"message": "What is the best crop for beginners?"}' "Basic chat"
    
    # Agricultural questions
    test_endpoint "POST" "/chat" '{"message": "How can I control pests organically?"}' "Organic pest control"
    test_endpoint "POST" "/chat" '{"message": "What are the best practices for soil health?"}' "Soil health"
    test_endpoint "POST" "/chat" '{"message": "What irrigation system is best for tomatoes?"}' "Irrigation systems"
    
    # Long message test
    long_message='{"message": "I have a large farm with multiple crops including tomatoes, peppers, corn, and beans. The soil is clay-based and we get moderate rainfall. I am interested in sustainable farming practices and want to improve my yields while reducing chemical inputs. Can you provide comprehensive advice on crop rotation, organic fertilization, pest management, and irrigation systems that would work well for my situation?"}'
    test_endpoint "POST" "/chat" "$long_message" "Long detailed question"
}

# Function to test error handling
test_error_handling() {
    echo -e "\n${YELLOW}=== Error Handling Tests ===${NC}"
    
    # Empty message
    test_endpoint "POST" "/chat" '{"message": ""}' "Empty message"
    
    # Missing message field
    test_endpoint "POST" "/chat" '{"other_field": "test"}' "Missing message field"
    
    # Invalid JSON
    test_endpoint "POST" "/chat" '{"message": "test", "invalid_field": "should cause error"}' "Invalid JSON structure"
    
    # Non-existent endpoint
    test_endpoint "GET" "/nonexistent" "" "Non-existent endpoint"
}

# Function to test performance
test_performance() {
    echo -e "\n${YELLOW}=== Performance Tests ===${NC}"
    
    # Multiple requests
    for i in {1..3}; do
        test_endpoint "POST" "/chat" "{\"message\": \"Performance test message $i\"}" "Performance test $i"
    done
}

# Function to check if backend is running
check_backend() {
    echo -e "\n${BLUE}Checking if backend is running...${NC}"
    
    if curl -s --max-time 5 "$BASE_URL/health" > /dev/null; then
        print_status "SUCCESS" "Backend is running at $BASE_URL"
        return 0
    else
        print_status "ERROR" "Backend is not running at $BASE_URL"
        print_status "INFO" "Start the backend with: cd backend && python main.py"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -u, --url URL       Set base URL (default: http://localhost:8000)"
    echo "  -t, --timeout SEC   Set timeout in seconds (default: 30)"
    echo "  --health-only       Test only health endpoints"
    echo "  --chat-only         Test only chat endpoints"
    echo "  --errors-only       Test only error handling"
    echo "  --performance-only  Test only performance"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 --health-only      # Test only health endpoints"
    echo "  $0 -u http://192.168.1.100:8000  # Test remote backend"
}

# Main function
main() {
    echo -e "${BLUE}🌾 Kangtani.ai Backend API Test Script${NC}"
    echo "=========================================="
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -u|--url)
                BASE_URL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --health-only)
                check_backend && test_health_endpoints
                exit 0
                ;;
            --chat-only)
                check_backend && test_chat_endpoints
                exit 0
                ;;
            --errors-only)
                check_backend && test_error_handling
                exit 0
                ;;
            --performance-only)
                check_backend && test_performance
                exit 0
                ;;
            *)
                print_status "ERROR" "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if backend is running
    if ! check_backend; then
        exit 1
    fi
    
    # Run all tests
    test_health_endpoints
    test_chat_endpoints
    test_error_handling
    test_performance
    
    echo -e "\n${GREEN}🎉 All tests completed!${NC}"
    echo -e "${BLUE}Check the output above for any errors or issues.${NC}"
}

# Run main function with all arguments
main "$@" 