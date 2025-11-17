# Rudi Customer App - Android Build and Installation Guide

This guide explains how to build the Rudi Customer app as an Android APK and install it on mobile devices.

## Prerequisites

Before building the app, ensure you have the following installed:

1. **Node.js** (v16 or later)
2. **Java JDK** (v21 - required for Capacitor 6)
   - Download JDK 21 from: https://adoptium.net/
   - Set `JAVA_HOME` environment variable to the JDK installation path
   - Add `%JAVA_HOME%\bin` to your PATH
   - Note: JDK 17 will not work with this project

3. **Android Studio** (with Android SDK)
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API level 21 or higher)
   - Set `ANDROID_HOME` environment variable to the Android SDK path (usually `C:\Users\<username>\AppData\Local\Android\Sdk`)
   - Add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools` to your PATH

4. **Capacitor CLI** (already installed via npm)

## Building the APK

1. **Install dependencies:**
   ```bash
   cd customer-frontend
   npm install
   ```

2. **Build the web app:**
   ```bash
   npm run build
   ```

3. **Add Android platform:**
   ```bash
   npx cap add android
   ```

4. **Sync web assets:**
   ```bash
   npx cap sync android
   ```

5. **Set Android SDK path (if not set):**
   - Create or edit `android/local.properties`:
     ```
     sdk.dir=C:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk
     ```

6. **Build the APK:**
   ```bash
   cd android
   gradlew.bat assembleDebug
   ```

The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Installing on Android Devices

### Method 1: Via ADB (USB Connection)

1. **Enable USB debugging on your Android device:**
   - Go to Settings > About Phone > Tap "Build number" 7 times to enable Developer Options
   - Go to Settings > Developer Options > Enable "USB Debugging"

2. **Connect your device via USB**

3. **Install the APK:**
   ```bash
   adb install "path/to/app-debug.apk"
   ```

### Method 2: Transfer and Install

1. **Transfer the APK file to your Android device:**
   - Use USB cable, email, Google Drive, or any file transfer method

2. **On your Android device:**
   - Go to Settings > Apps > Special access > Install unknown apps
   - Enable "Allow from this source" for your file manager or browser
   - Open the APK file using your file manager
   - Tap "Install" when prompted

### Method 3: Via Android Studio

1. **Open the project in Android Studio:**
   ```bash
   npx cap open android
   ```

2. **Connect your device and run:**
   - In Android Studio, click the "Run" button (green play icon)
   - Select your device from the list

## Network Configuration

The app is configured to connect to your local backend at `http://192.168.100.3:8000`.

**Requirements:**
- Your Android device must be on the same Wi-Fi network as your development machine
- Ensure the backend is running: `cd backend && python run.py`
- The app uses HTTP (not HTTPS) for local development, so cleartext traffic is enabled

## Troubleshooting

### Build Issues
- **JAVA_HOME not set:** Ensure Java JDK is installed and JAVA_HOME is configured
- **ANDROID_HOME not set:** Install Android Studio and set ANDROID_HOME to the SDK path
- **Gradle errors:** Try cleaning the build: `gradlew.bat clean` then `gradlew.bat assembleDebug`

### Installation Issues
- **"App not installed":** Enable "Install unknown apps" in Android settings
- **Connection issues:** Verify your device can access the backend URL
- **USB debugging not working:** Try different USB cable or port

### Runtime Issues
- **Network errors:** Ensure backend is running and accessible
- **Permissions:** Grant necessary permissions when prompted

## Production Deployment

For production builds:
1. Configure HTTPS for the backend
2. Remove `android:usesCleartextTraffic="true"` from `AndroidManifest.xml`
3. Use `gradlew.bat assembleRelease` for signed APK
4. Sign the APK with your keystore for Google Play Store

## Support

If you encounter issues, check the Capacitor documentation: https://capacitorjs.com/docs/android