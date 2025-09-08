# Android Studio Setup for macOS Ventura 13.7.7

## Prerequisites for your iMac 2017

### System Requirements
- ✅ macOS Ventura 13.7.7 (your current system)
- ✅ iMac 2017 (supported hardware)
- 8GB+ RAM (16GB recommended)
- 20GB+ free disk space

### Required Software Installation

#### 1. Install Java Development Kit (JDK 11)
```bash
# Download Oracle JDK 11 or OpenJDK 11
# For macOS Ventura compatibility, use JDK 11
brew install openjdk@11

# Set JAVA_HOME
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@11"' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 2. Install Android Studio (Compatible Version)
- Download **Android Studio Dolphin 2021.3.1** or later
- This version is specifically compatible with macOS Ventura 13.7.7
- Avoid the latest versions if you encounter compatibility issues

#### 3. Install Node.js (LTS Version)
```bash
# Install Node.js 18 LTS (most stable for React Native)
brew install node@18
npm install -g yarn
```

## Android Studio Configuration

### SDK Setup
1. Open Android Studio
2. Go to **Preferences > Appearance & Behavior > System Settings > Android SDK**
3. Install these SDK versions:
   - ✅ Android 13 (API 33) - Recommended
   - ✅ Android 12 (API 32) - Alternative
   - ✅ Android 11 (API 30) - Fallback

### Required SDK Tools
In SDK Tools tab, install:
- ✅ Android SDK Build-Tools 33.0.0
- ✅ Android Emulator
- ✅ Android SDK Platform-Tools
- ✅ Intel x86 Emulator Accelerator (HAXM installer)

### Environment Variables
Add to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

## Project Setup in Android Studio

### 1. Import the Project
1. Open Android Studio
2. Choose **"Import project (Gradle, Eclipse ADT, etc.)"**
3. Navigate to your project folder and select the `android` directory
4. Click **OK** and wait for Gradle sync

### 2. Configure Emulator (Optimized for iMac 2017)
Create a new AVD with these specs:
- **Device**: Pixel 4 (recommended for your hardware)
- **System Image**: Android 13 (API 33) x86_64
- **RAM**: 2048 MB (don't exceed this on iMac 2017)
- **Internal Storage**: 2048 MB
- **Graphics**: Software - GLES 2.0 (better compatibility)

### 3. Gradle Configuration
If you encounter Gradle issues, create `gradle.properties` in android folder:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
```

## Running the App

### Method 1: From Replit
1. Ensure your React Native server is running on Replit
2. Update the API endpoint in your mobile app code:
   ```javascript
   const API_BASE_URL = 'https://your-replit-name.replit.app';
   ```
3. In Android Studio, click **Run** button or press `Shift + F10`

### Method 2: Local Development
1. Clone the project to your Mac:
   ```bash
   git clone [your-replit-git-url]
   cd ulimi-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start Metro bundler:
   ```bash
   npx react-native start
   ```

4. In Android Studio, run the app on emulator

## Troubleshooting Common Issues

### Gradle Build Failed
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

### Emulator Won't Start
1. Check HAXM installation:
   ```bash
   /opt/homebrew/bin/haxm_check
   ```
2. If HAXM fails, use software rendering:
   - AVD Manager > Edit AVD > Advanced Settings
   - Graphics: Software - GLES 2.0

### Metro Bundle Error
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### Build Tools Version Issues
In `android/app/build.gradle`, ensure:
```gradle
compileSdk 33
targetSdk 33
buildToolsVersion "33.0.0"
```

## Network Configuration

### Connecting to Replit Server
In your React Native code, use:
```javascript
// For emulator
const API_URL = 'http://10.0.2.2:5000';

// For Replit hosted
const API_URL = 'https://your-replit-name.replit.app';
```

### Enable Clear Text Traffic
Already configured in `AndroidManifest.xml`:
```xml
android:usesCleartextTraffic="true"
```

## Performance Optimization for iMac 2017

### 1. Android Studio Settings
- **Preferences > Build > Compiler**: Increase heap size to 2048 MB
- **Preferences > Build > Gradle**: Use Gradle daemon
- **Disable unnecessary plugins** to improve performance

### 2. Emulator Optimization
- Use **x86_64** images instead of ARM
- Limit RAM to **2048 MB** maximum
- Enable **Hardware acceleration** if supported

### 3. Development Mode
- Use **Debug** builds for testing
- Enable **Instant Run** for faster rebuilds
- Close other applications while developing

## Final Steps

1. **Import project** into Android Studio
2. **Sync Gradle** files
3. **Create/start emulator**
4. **Run the app** (green play button)
5. **Connect to your Replit backend**

## Expected Result
- ✅ Android Studio opens the project successfully
- ✅ Gradle builds without errors
- ✅ Emulator starts and shows the Ulimi app
- ✅ App connects to your Replit backend
- ✅ Full functionality: reading, audio, translation features

Your iMac 2017 with Ventura 13.7.7 should handle this React Native project well with these optimized settings!