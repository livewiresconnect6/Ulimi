# Ulimi - macOS Setup Guide

## Overview
Ulimi is a web application that runs directly in your browser on macOS. **No Android Studio, emulators, or mobile development tools are required.**

## System Requirements
- macOS Ventura 13.7.7 (your current system)
- Modern web browser (Safari, Chrome, Firefox, or Edge)
- Internet connection

## How to Use Ulimi on Your macOS System

### Option 1: Using Replit (Recommended)
1. **Open your web browser** (Safari, Chrome, etc.)
2. **Go to your Replit project** where this code is running
3. **Click the web preview** or visit the URL shown in the console (typically `https://your-repl-name.replit.app`)
4. **Start using the app** - it works just like any website!

### Option 2: Run Locally on Your Mac
If you want to run this on your local macOS machine:

1. **Install Node.js** (if not already installed):
   - Visit https://nodejs.org
   - Download the LTS version for macOS
   - Run the installer

2. **Download the project code**:
   ```bash
   # In Terminal
   git clone [your-repo-url]
   cd [project-folder]
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to `http://localhost:5000`

## Features Available in Web Browser
- ✅ Story reading and writing
- ✅ Audio narration with text-to-speech
- ✅ Multi-language translation
- ✅ User authentication and profiles
- ✅ Personal library management
- ✅ Responsive design (works on desktop and mobile browsers)
- ✅ Touch-friendly interface on touchscreen Macs

## Browser Compatibility
- **Safari**: Full support ✅
- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Edge**: Full support ✅

## Important Notes

### Why No Android Studio?
- This is a **web application**, not a mobile app
- It runs in browsers, not on mobile devices
- No compilation or building required for mobile platforms
- No Gradle, Android SDK, or emulators needed

### Benefits of Web App on macOS
- **Instant access** - no installation required
- **Cross-platform** - works on any device with a browser
- **Easy updates** - refresh the page for latest version
- **Better debugging** - use browser developer tools
- **No compatibility issues** - standard web technologies

### Accessing from Other Devices
Since this is a web app, you can:
- Access from your iPhone/iPad Safari browser
- Share the URL with others
- Use on any computer with internet access
- No app store submission required

## Troubleshooting

### If the app doesn't load:
1. Check internet connection
2. Try a different browser
3. Clear browser cache and cookies
4. Check if the server is running (in Replit console)

### If features don't work:
1. Enable JavaScript in your browser
2. Allow microphone access for audio features
3. Enable location services if needed for regional content

## Getting Started
1. **Open the app** in your browser
2. **Sign up** for a new account or use demo mode
3. **Complete onboarding** to set your preferences
4. **Start reading** stories or create your own
5. **Enjoy** the multilingual features and audio narration

---

**Remember**: This is a web application designed to work perfectly in your browser on macOS Ventura 13.7.7. No mobile development tools are needed!