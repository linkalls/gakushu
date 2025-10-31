# Anki Alternative - Mobile App

React Native mobile app using Expo Router and NativeWind.

## Quick Start

### Development

```bash
# Start the Expo development server
bun run dev

# Run on Android
bun run android

# Run on iOS
bun run ios
```

### Building for Android

#### Prerequisites

- JDK 17 or higher
- Android SDK
- EAS CLI: `bun install -g eas-cli`

#### Generate Android Project

```bash
# First time setup
bun run prebuild
```

#### Build APK

```bash
# Preview build (debug)
bun run build:preview

# Production build
bun run build:production

# Or use EAS CLI directly
eas build --platform android --local --profile preview
```

## Testing

```bash
# Run tests
bun test
```

## Project Structure

```
mobile/
├── app/              # Expo Router pages
│   ├── _layout.tsx  # Root layout
│   ├── index.tsx    # Home page
│   └── ...
├── src/
│   ├── contexts/    # React Context providers
│   └── __tests__/   # Test files
├── android/         # Native Android project (generated)
├── app.json         # Expo configuration
├── eas.json         # EAS Build configuration
└── package.json
```

## Configuration

### EAS Build Profiles

- **development**: Development client with internal distribution
- **preview**: Debug APK for testing
- **production**: Release APK for distribution

### Environment Variables

Set environment variables in `eas.json` under each profile's `env` section.

## Technologies

- **Expo SDK 54**: Cross-platform framework
- **Expo Router**: File-based routing
- **NativeWind**: Tailwind CSS for React Native
- **Solito**: Universal navigation
- **React 19**: Latest React features
- **TypeScript**: Type safety

## Learn More

- [Build Guide](../BUILD_GUIDE.md) - Detailed build instructions
- [Quick Start](../QUICKSTART_BUILD.md) - Get started quickly
- [Expo Documentation](https://docs.expo.dev/)

