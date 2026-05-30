import 'package:device_apps/device_apps.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

const _emulatorPackage = 'com.explusalpha.NeoEmu';
const _emulatorApkUrl =
    'https://github.com/PiyushMishra318/Tsukiyomi-Server/raw/master/apk/GBA.apk';

Future<void> openGbaEmulatorOrInstall() async {
  final installed = await DeviceApps.isAppInstalled(_emulatorPackage);
  if (installed) {
    await DeviceApps.openApp(_emulatorPackage);
    return;
  }
  final uri = Uri.parse(_emulatorApkUrl);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

Future<void> openRomOrInstall(int refId, {required bool downloaded}) async {
  if (downloaded) {
    await openGbaEmulatorOrInstall();
    return;
  }
  final uri = Uri.parse(
    '${const String.fromEnvironment('TSUKIYOMI_API_URL', defaultValue: 'http://10.0.2.2:3000')}/ROMs/Rom$refId.zip',
  );
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}
