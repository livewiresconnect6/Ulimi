#!/bin/bash

echo "🚀 Starting comprehensive functionality test for Ulimi mobile app..."

# Test 1: Authentication
echo "📱 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testauthor2",
    "email": "testauthor2@example.com", 
    "password": "password123",
    "displayName": "Maria Rodriguez"
  }')
echo "✅ Auth Response: $AUTH_RESPONSE"

# Test 2: Story Creation
echo "📚 Testing Story Creation..."
STORY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Adventures in Space",
    "description": "An exciting journey through the galaxy",
    "genre": "Science Fiction",
    "language": "en",
    "authorId": 6,
    "chapters": [
      {"title": "Chapter 1: Liftoff", "content": "The spaceship engines roared to life..."}
    ],
    "isDraft": false,
    "isPublished": true,
    "content": "The spaceship engines roared to life..."
  }')
echo "✅ Story Creation: $STORY_RESPONSE"

# Test 3: Author Profile
echo "👤 Testing Author Profile..."
AUTHOR_RESPONSE=$(curl -s -X GET http://localhost:5000/api/authors/6)
echo "✅ Author Profile: $AUTHOR_RESPONSE"

# Test 4: Author Stories
echo "📖 Testing Author Stories..."
AUTHOR_STORIES=$(curl -s -X GET http://localhost:5000/api/authors/6/stories)
echo "✅ Author Stories: $AUTHOR_STORIES"

# Test 5: Featured Authors
echo "🌟 Testing Featured Authors..."
FEATURED_AUTHORS=$(curl -s -X GET http://localhost:5000/api/featured-authors)
echo "✅ Featured Authors: $FEATURED_AUTHORS"

# Test 6: All Stories
echo "📚 Testing All Stories..."
ALL_STORIES=$(curl -s -X GET http://localhost:5000/api/stories)
echo "✅ All Stories: $ALL_STORIES"

# Test 7: Follow Author
echo "👥 Testing Follow Author..."
FOLLOW_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/5/following \
  -H "Content-Type: application/json" \
  -d '{"authorId": 6}')
echo "✅ Follow Author: $FOLLOW_RESPONSE"

# Test 8: Like Author
echo "❤️ Testing Like Author..."
LIKE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/authors/6/like \
  -H "Content-Type: application/json" \
  -d '{"userId": 5}')
echo "✅ Like Author: $LIKE_RESPONSE"

echo "🎉 All functionality tests completed!"