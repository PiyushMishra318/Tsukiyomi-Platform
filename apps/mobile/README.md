# Tsukiyomi

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)

Flutter Android client for the [Tsukiyomi Server](https://github.com/PiyushMishra318/Tsukiyomi-Server) GBA ROM catalog. Browse games, manage favorites, and launch ROMs with a connected GBA emulator.

## Features

- Phone OTP sign-in (Firebase Auth)
- Home feed with recently played, recommendations, and trending ROMs
- Genre browse and favorites library
- ROM detail view with download / play actions
- Configurable API base URL

## Requirements

- Flutter 3.24+ ([install guide](https://docs.flutter.dev/get-started/install))
- Android SDK (API 21+)
- Firebase project with **Phone** auth enabled
- Running [Tsukiyomi-Server](https://github.com/PiyushMishra318/Tsukiyomi-Server) instance

## Setup

```bash
git clone git@github.com:PiyushMishra318/Tsukiyomi.git
cd Tsukiyomi
flutter pub get
```

1. Replace `android/app/google-services.json` with your Firebase Android config.
2. Point the app at your API:

```bash
flutter run --dart-define=TSUKIYOMI_API_URL=https://your-api.example.com
```

Default API URL: `https://tsukiyomi.herokuapp.com`

## Scripts

| Command | Description |
|---------|-------------|
| `flutter run` | Run on a connected device/emulator |
| `flutter test` | Run unit tests |
| `flutter analyze` | Static analysis |
| `flutter build apk` | Build release APK |

## Project layout

```text
lib/
├── config/api_config.dart    # API base URL
├── services/tsukiyomi_api.dart
├── utils/emulator_launcher.dart
├── login.dart                # Firebase phone auth
├── start_page.dart           # Main shell + navigation
├── home_page.dart
├── browse_page.dart
├── library_page.dart
└── detail_page.dart
```

## Related repos

- [Tsukiyomi-Server](https://github.com/PiyushMishra318/Tsukiyomi-Server) — NestJS backend API

## License

MIT © 2026 [Piyush Mishra](https://github.com/PiyushMishra318)
