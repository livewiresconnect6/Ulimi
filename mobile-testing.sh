#!/bin/bash

# Mobile Testing Script for Ulimi Android App
echo "🚀 Starting Ulimi Mobile App Testing..."

# Function to check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v npx &> /dev/null; then
        echo "❌ Node.js/npm not found. Please install Node.js"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        echo "❌ Java not found. Please install Java JDK 11+"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to build web assets
build_web_assets() {
    echo "📦 Building web assets..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Web build completed"
    else
        echo "❌ Web build failed"
        exit 1
    fi
}

# Function to sync mobile app
sync_mobile_app() {
    echo "📱 Syncing mobile app..."
    
    # Copy web assets to mobile
    cp -r dist/public/* mobile-build/
    
    # Sync with Capacitor
    npx cap sync android
    
    if [ $? -eq 0 ]; then
        echo "✅ Mobile sync completed"
    else
        echo "❌ Mobile sync failed"
        exit 1
    fi
}

# Function to test on emulator
test_emulator() {
    echo "🔧 Testing on Android emulator..."
    
    # Check if emulator is running
    adb devices | grep -q "emulator"
    
    if [ $? -eq 0 ]; then
        echo "📱 Emulator detected, installing app..."
        npx cap run android
    else
        echo "⚠️ No emulator detected. Please start Android emulator first"
        echo "To start emulator: Android Studio → AVD Manager → Start"
    fi
}

# Function to test on device
test_device() {
    echo "📱 Testing on physical device..."
    
    # Check if device is connected
    adb devices | grep -v "List of devices" | grep -q "device"
    
    if [ $? -eq 0 ]; then
        echo "📱 Device detected, installing app..."
        npx cap run android
    else
        echo "⚠️ No device detected. Please:"
        echo "1. Connect Android device via USB"
        echo "2. Enable Developer Options"
        echo "3. Enable USB Debugging"
    fi
}

# Function to open in Android Studio
open_android_studio() {
    echo "🎯 Opening in Android Studio..."
    npx cap open android
    
    echo "📋 Android Studio Instructions:"
    echo "1. Wait for Gradle sync to complete"
    echo "2. Connect device or start emulator"
    echo "3. Click Run (green play button)"
    echo "4. Select target device"
}

# Main menu
show_menu() {
    echo ""
    echo "🎯 Ulimi Mobile Testing Options:"
    echo "1. Build and sync mobile app"
    echo "2. Test on Android emulator"
    echo "3. Test on physical device"
    echo "4. Open in Android Studio"
    echo "5. Full testing workflow"
    echo "6. Exit"
    echo ""
    read -p "Choose option (1-6): " choice
    
    case $choice in
        1)
            check_prerequisites
            build_web_assets
            sync_mobile_app
            ;;
        2)
            test_emulator
            ;;
        3)
            test_device
            ;;
        4)
            open_android_studio
            ;;
        5)
            check_prerequisites
            build_web_assets
            sync_mobile_app
            echo "Choose testing method:"
            echo "a) Emulator"
            echo "b) Physical device"
            echo "c) Android Studio"
            read -p "Choice (a/b/c): " test_choice
            
            case $test_choice in
                a) test_emulator ;;
                b) test_device ;;
                c) open_android_studio ;;
                *) echo "Invalid choice" ;;
            esac
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option"
            show_menu
            ;;
    esac
}

# Start the script
check_prerequisites
show_menu