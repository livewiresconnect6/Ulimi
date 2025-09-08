# Ulimi - Multilingual Reading and Audiobook Platform

## Overview

Ulimi is a Wattpad-inspired reading and audiobook platform designed to make literature accessible across multiple languages. The application provides story reading, audio narration with text-to-speech, and real-time translation capabilities supporting multiple African languages, European languages, and Chinese.

## System Architecture

### Mobile App Architecture (React Native)
- **Framework**: React Native 0.80.2 with TypeScript
- **Navigation**: React Navigation v7 with bottom tabs and stack navigation
- **UI Framework**: React Native Paper for Material Design components
- **Icons**: React Native Vector Icons (Material Icons)
- **State Management**: TanStack Query for server state management
- **Local Storage**: AsyncStorage for user session persistence
- **Animations**: React Native Reanimated and Gesture Handler

### Legacy Web Architecture
- **Framework**: React 18 with TypeScript (preserved for reference)
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Firebase Authentication with custom user management
- **File Storage**: Firebase Storage for images and audio files

### Native Mobile Design
- **Platform**: React Native for iOS and Android
- **Navigation**: Bottom tab navigation with stack navigation for details
- **Touch Interface**: Native mobile gestures and interactions
- **Platform Integration**: Native Android and iOS capabilities
- **Performance**: Native rendering for optimal mobile performance

## Key Components

### Authentication System
- Firebase Authentication integration
- Demo mode for development/testing
- Custom user profiles with onboarding flow
- User preferences and settings management

### Story Management
- CRUD operations for stories and chapters
- Multi-chapter story support
- Genre categorization and tagging
- Featured stories and author highlighting
- Reading progress tracking

### Translation Engine
- Google Translate API integration
- Support for 12 languages including African languages
- Cached translations for performance
- Language detection and switching

### Audio System
- Browser-based text-to-speech synthesis
- Custom audio file upload support
- Playback controls (play/pause, speed, seeking)
- Multi-language voice synthesis

### User Library System
- Personal story collections
- Reading history and progress
- Favorite stories and authors
- Social features (likes, follows)

## Data Flow

### User Journey
1. **Authentication**: Users sign in via Firebase or demo mode
2. **Onboarding**: New users complete preference setup
3. **Discovery**: Browse featured stories and authors
4. **Reading**: Access stories with translation options
5. **Audio**: Listen to stories with text-to-speech
6. **Library**: Save and organize personal collections

### Data Management
- Database queries through Drizzle ORM
- Real-time updates with TanStack Query
- Local caching for offline reading capabilities
- Progressive loading for large story content

## External Dependencies

### Core Services
- **Firebase**: Authentication and file storage
- **Google Translate API**: Real-time translation services
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Vite**: Development server and build tool
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Server-side bundling for production

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library

## Deployment Strategy

### Development Environment
- Replit-optimized development setup
- Hot module reloading with Vite
- Integrated PostgreSQL database
- Environment variable management

### Production Deployment Options
1. **Replit Deployment**: One-click deployment on Replit infrastructure
2. **Railway**: Container-based deployment with database
3. **Vercel**: Serverless deployment for frontend
4. **Netlify**: Static site deployment with serverless functions

### Build Process
- Client-side: Vite build to `dist/public`
- Server-side: ESBuild bundling to `dist/index.js`
- Database: Drizzle migrations and schema sync
- Assets: Optimized images and static files

### Environment Configuration
- Firebase credentials for authentication
- Google Translate API key for translations
- Database connection strings
- Storage bucket configurations

## Changelog

```
- June 13, 2025. Initial setup
- June 13, 2025. Completed full story and author interaction system
  - Added like, favorite, and library buttons to all story pages
  - Implemented author follow, like, favorite, and library features
  - Added comprehensive image upload functionality for profiles and covers
  - Fixed authentication flow and onboarding persistence
  - All interaction buttons work consistently across Home, Browse, Read, Audiobook, Author, and Profile pages
- August 6, 2025. Complete React Native Mobile App for macOS/Android Studio
  - Created full React Native mobile application with proper Android Studio integration
  - Built comprehensive Android configuration for macOS Ventura 13.7.7 compatibility
  - Implemented native mobile screens: Home, Browse, Library, Profile, Read, Audiobook, Author
  - Added React Navigation with bottom tabs and stack navigation
  - Integrated React Native Paper for Material Design UI components
  - Created Android Studio project structure with Gradle build configuration
  - Added comprehensive setup guide for iMac 2017 with Ventura 13.7.7
  - Optimized emulator settings and build configurations for older Mac hardware
  - Maintained backend compatibility with Express server running on port 5000
- August 7, 2025. Google Play Store Mobile App for Parents & Households
  - Converted project to React Native mobile app for Google Play Store deployment
  - Created complete mobile app structure in mobile-app/ directory
  - Built family-friendly interface with Material Design for parents and children
  - Implemented offline reading capabilities and audio features for households
  - Added Google Play Store deployment configuration and build scripts
  - Created comprehensive deployment guide for Google Play Store submission
  - Optimized app for parent-child shared reading experiences
  - Ensured mobile app connects to existing Express backend on port 5000

- August 7, 2025. Fixed Deployment Issues with CommonJS/ESM Module Conflicts (REAPPLIED)
  - Resolved server build failures due to CommonJS/ESM module conflicts
  - Updated esbuild configuration to use ESM format instead of CommonJS
  - Fixed top-level await support by implementing proper ESM configuration
  - Resolved import.meta properties causing undefined dirname values
  - Created custom build script (build.js) with proper external dependency handling
  - Added comprehensive deployment script (deploy.sh) with build verification
  - Created production-ready Docker configuration for containerized deployment
  - Generated detailed deployment guide (DEPLOYMENT.md) with multiple deployment options
  - Implemented ESM compatibility shims for __dirname and __filename globals
  - All deployment builds now generate clean ESM output ready for production
  - Build verification: Client (858KB) and Server (192KB) compile successfully
  - Production server passes syntax validation and starts correctly
  - Fixed client build path handling to work with Vite's output directory structure

- August 8, 2025. Complete Capacitor Mobile App for Android Development
  - Successfully converted web application to native Android mobile app using Capacitor
  - Created complete Android Studio project structure with Gradle build configuration
  - Installed Capacitor core plugins: App, Haptics, Keyboard, StatusBar for mobile functionality
  - Built optimized web assets (858KB) and integrated with Android WebView container
  - Configured mobile-specific settings: HTTPS scheme, dark theme, keyboard handling
  - Generated UlimiMobile.zip package (1.4MB) containing complete Android project
  - Included comprehensive MOBILE_SETUP_GUIDE.md with development instructions
  - App identity: com.ulimi.app "Ulimi - Stories & Audiobooks" ready for Google Play
  - Mobile app maintains full compatibility with existing Express backend on port 5000
  - Created deployment-ready Android project for immediate development and testing

- August 8, 2025. Enhanced Mobile App with Professional Features
  - Added complete push notification system with customizable preferences
  - Implemented offline story downloads and storage management (useOfflineStorage hook)
  - Integrated camera functionality for profile photos and image upload
  - Built native sharing capabilities for stories (email, SMS, social media)
  - Created performance optimization settings with data saver and lazy loading
  - Installed 12 Capacitor plugins: Camera, Filesystem, Share, Push Notifications, etc.
  - Built mobile-specific components: NotificationSettings, OfflineStoryManager, ProfilePhotoUpload
  - Added comprehensive mobile hooks for all native device features
  - Generated UlimiMobile-Enhanced.zip (1.5MB) with complete feature set
  - Created professional-grade mobile app ready for Google Play Store deployment

- August 9, 2025. Implemented User-Requested Enhancements
  - Enhanced AuthorScreen with proper author profile functionality for all authors
  - Added colorful Wattpad-style design to replace plain white interfaces
  - Implemented vibrant gradients and modern card layouts across ProfileScreen, WriteScreen, and AuthorScreen
  - Updated color schemes: purple/blue gradients (#667eea) instead of plain orange
  - Enhanced mobile interface with Material Design icons and proper visual hierarchy
  - Verified all functionality works correctly through comprehensive testing
  - Confirmed build configurations are functional for Android Studio deployment
  - All API endpoints tested and working: authentication, story creation, author profiles
  - Created comprehensive test script for full system verification

- August 18, 2025. Fixed Authentication System and Database Reset
  - Completely wiped all user data from database for clean start
  - Removed quick login buttons since no users exist
  - Fixed authentication system to properly handle new user signup
  - Updated backend to accept demo passwords in development mode
  - Simplified login form to focus on new account creation
  - Authentication system now ready for multiple users to sign up fresh

- August 22, 2025. Fixed Mobile Navigation Display Issues
  - Resolved critical mobile layout problems where desktop header was showing on phones
  - Fixed bottom navigation bar to properly display on mobile devices
  - Used JavaScript-based mobile detection instead of CSS media queries for better compatibility
  - Removed desktop header navigation on mobile screens (width <= 768px)
  - Bottom navigation now shows amber-styled Home, Browse, Write, Library, Profile buttons
  - Mobile users can now properly navigate the app with touch-friendly bottom controls
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Platform preference: React Native mobile app for Google Play Store deployment.
Target audience: Parents and households who want downloadable African stories and audiobooks.
Hardware: Mobile devices (Android phones and tablets).
Deployment goal: Google Play Store for wide accessibility in homes and classrooms.
Design preference: Wattpad-style colorful interface with vibrant gradients and modern card layouts.
Priority: Focus on specific user-requested changes and avoid unnecessary modifications.
```