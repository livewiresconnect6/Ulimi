# Google Play Store Deployment Guide

## 📱 Preparing Ulimi for Google Play Store

### 1. App Information
- **Package Name**: `com.ulimi.app`
- **App Name**: "Ulimi - Stories & Audiobooks"
- **Category**: Education / Books & Reference
- **Target Audience**: Families, Parents, Children

### 2. Build Release APK

#### Generate Keystore (First time only)
```bash
cd android/app
keytool -genkey -v -keystore ulimi-release-key.keystore -alias ulimi -keyalg RSA -keysize 2048 -validity 10000
```

#### Configure Signing
Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('ulimi-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'ulimi'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Build Release
```bash
cd android
./gradlew assembleRelease

# Or build App Bundle (recommended)
./gradlew bundleRelease
```

### 3. App Store Assets Required

#### App Icons
- **48x48** (mdpi)
- **72x72** (hdpi)
- **96x96** (xhdpi)
- **144x144** (xxhdpi)
- **192x192** (xxxhdpi)
- **512x512** (Play Store)

#### Screenshots
- **Phone**: 1080x1920 (minimum 2 screenshots)
- **Tablet**: 1200x1920 (optional but recommended)
- **Feature Graphic**: 1024x500

#### App Description
```
Ulimi - Stories & Audiobooks

Discover amazing stories in multiple languages! Perfect for families who love reading together.

FEATURES:
📚 Multilingual Stories - Read in 12+ languages including African languages
🎧 Audio Narration - Listen to stories with text-to-speech
🌍 Real-time Translation - Understand stories in any language
👨‍👩‍👧‍👦 Family-Friendly - Safe content for all ages
📖 Personal Library - Save your favorite stories
✨ Beautiful Interface - Designed for mobile reading

LANGUAGES SUPPORTED:
English, Spanish, French, Portuguese, Swahili, Yoruba, Igbo, Hausa, Amharic, Chinese, and more!

Perfect for:
- Parents reading to children
- Language learners
- Multilingual families
- Educators and students
- Anyone who loves stories

Download Ulimi today and explore the world of multilingual storytelling!
```

### 4. App Content Rating

#### Content Categories
- **Age Group**: Everyone
- **Content**: Educational content, no inappropriate material
- **Interactive Elements**: Users can interact with stories
- **Data Collection**: User accounts, reading preferences

#### Privacy Policy Required
Must include privacy policy covering:
- Data collection practices
- How user data is used
- Third-party services (Firebase, Google Translate)
- Contact information

### 5. Play Console Setup

#### Developer Account
1. **Create Google Play Console account** ($25 one-time fee)
2. **Verify identity** with valid ID
3. **Complete developer profile**

#### App Listing
1. **Upload APK/AAB** file
2. **Fill app information**
3. **Upload screenshots** and graphics
4. **Set pricing** (Free recommended)
5. **Select countries** for distribution

#### Store Listing
- **Short Description**: 80 characters
- **Full Description**: 4000 characters
- **Keywords**: story, audiobook, multilingual, education, family
- **Website**: Link to your website (optional)
- **Email**: Support contact email

### 6. Testing Track

#### Internal Testing
- Upload to Internal testing track
- Test with team members
- Verify all features work

#### Closed Testing
- Create test group with family/friends
- Gather feedback
- Fix any issues

#### Open Testing (Optional)
- Limited public beta
- Collect user feedback
- Final polish before release

### 7. Release Checklist

#### Technical Requirements
- ✅ Minimum SDK: API 21 (Android 5.0)
- ✅ Target SDK: API 34 (Android 14)
- ✅ 64-bit architecture support
- ✅ No security vulnerabilities
- ✅ Follows Android design guidelines

#### Content Requirements
- ✅ Original content or proper licensing
- ✅ Family-friendly material
- ✅ No copyright infringement
- ✅ Clear app functionality
- ✅ Working privacy policy

#### Store Requirements
- ✅ High-quality screenshots
- ✅ Professional app icon
- ✅ Clear app description
- ✅ Accurate content rating
- ✅ Valid contact information

### 8. Submission Process

1. **Review all information** for accuracy
2. **Submit for review** (takes 1-3 days)
3. **Respond to any feedback** from Google
4. **Publish when approved**

### 9. Post-Launch

#### Monitor Performance
- Watch for crashes or bugs
- Monitor user reviews
- Track download statistics

#### Updates
- Regular content updates
- Bug fixes and improvements
- New language support
- Feature enhancements

#### Marketing
- Share on social media
- Family and education communities
- Language learning forums
- Multilingual parent groups

Your Ulimi app is ready for Google Play Store success!