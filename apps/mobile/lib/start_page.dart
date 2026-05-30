import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tsukiyomi/browse_page.dart';
import 'package:tsukiyomi/home_page.dart';
import 'package:tsukiyomi/library_page.dart';
import 'package:tsukiyomi/more_page.dart';
import 'package:tsukiyomi/services/tsukiyomi_api.dart';
import 'package:tsukiyomi/utils/emulator_launcher.dart';

class StartPage extends StatefulWidget {
  const StartPage({super.key, required this.phone});

  final String phone;

  @override
  State<StartPage> createState() => _StartPageState();
}

class _StartPageState extends State<StartPage> {
  final _api = TsukiyomiApi();
  int _index = 0;
  Map<String, dynamic>? _user;
  DateTime? _lastBackPress;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await _api.getUser(widget.phone);
    if (!mounted) return;
    setState(() => _user = user);
  }

  Future<bool> _onWillPop() async {
    final now = DateTime.now();
    if (_lastBackPress == null ||
        now.difference(_lastBackPress!) > const Duration(seconds: 3)) {
      _lastBackPress = now;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Press back again to leave')),
      );
      return false;
    }
    await SystemNavigator.pop();
    return true;
  }

  Widget _pageForIndex(int index) {
    final user = _user;
    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }
    switch (index) {
      case 1:
        return BrowsePage(user: user);
      case 2:
        return LibraryPage(user: user);
      case 3:
        return MorePage(user: user);
      case 0:
      default:
        return HomePage(user: user);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        await _onWillPop();
      },
      child: Scaffold(
        floatingActionButton: Padding(
          padding: const EdgeInsets.only(top: 130),
          child: FloatingActionButton(
            onPressed: openGbaEmulatorOrInstall,
            backgroundColor: Colors.black,
            foregroundColor: Colors.red.shade900,
            child: const Icon(Icons.play_arrow),
          ),
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.endTop,
        body: _pageForIndex(_index),
        bottomNavigationBar: CurvedNavigationBar(
          index: _index,
          color: Colors.black,
          height: 50,
          buttonBackgroundColor: Colors.grey.shade900,
          backgroundColor: Colors.red.shade900,
          onTap: (index) => setState(() => _index = index),
          items: const [
            Icon(Icons.home),
            Icon(Icons.search),
            Icon(Icons.file_download),
            Icon(Icons.list),
          ],
        ),
      ),
    );
  }
}
