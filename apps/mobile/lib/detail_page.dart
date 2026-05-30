import 'dart:io';

import 'package:flutter/material.dart';
import 'package:tsukiyomi/services/tsukiyomi_api.dart';
import 'package:tsukiyomi/utils/emulator_launcher.dart';

class DetailPage extends StatefulWidget {
  const DetailPage({super.key, required this.index, required this.user});

  final int index;
  final Map<String, dynamic> user;

  @override
  State<DetailPage> createState() => _DetailPageState();
}

class _DetailPageState extends State<DetailPage> {
  final _api = TsukiyomiApi();
  Map<String, dynamic>? _rom;
  Color? _favoriteColor;
  bool _downloaded = false;

  @override
  void initState() {
    super.initState();
    _loadRom();
  }

  Future<void> _loadRom() async {
    final rom = await _api.getGame(widget.index);
    if (!mounted || rom == null) return;

    final downloaded = File('/sdcard/Rom${rom['refid']}.zip').existsSync();
    final phone = widget.user['phone'].toString();
    final liked = await _api.isFavorite(phone, rom['_id'].toString());

    setState(() {
      _rom = rom;
      _downloaded = downloaded;
      _favoriteColor = liked ? Colors.red : null;
    });
  }

  Future<void> _toggleFavorite() async {
    final rom = _rom;
    if (rom == null) return;
    final phone = widget.user['phone'].toString();
    final liked = await _api.toggleFavorite(phone, rom);
    if (!mounted || liked == null) return;
    setState(() => _favoriteColor = liked ? Colors.red : null);
  }

  @override
  Widget build(BuildContext context) {
    final rom = _rom;
    final screenWidth = MediaQuery.sizeOf(context).width;

    return Scaffold(
      backgroundColor: Colors.black,
      body: rom == null
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: MediaQuery.sizeOf(context).height,
                  pinned: true,
                  backgroundColor: Colors.black,
                  flexibleSpace: FlexibleSpaceBar(
                    collapseMode: CollapseMode.pin,
                    background: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          rom['thumbnail'].toString(),
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Image.asset('assets/bg2.png', fit: BoxFit.cover),
                        ),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black54,
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.9),
                              ],
                            ),
                          ),
                          child: Align(
                            alignment: Alignment.bottomLeft,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(
                                rom['name'].toString(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontFamily: 'Mozart',
                                  fontSize: 32,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 540,
                          left: 0,
                          right: 0,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  rom['description']?.toString() ??
                                      rom['name'].toString(),
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.8),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    _actionButton(
                                      icon: Icons.favorite,
                                      label: 'Favourite',
                                      color: _favoriteColor,
                                      onPressed: _toggleFavorite,
                                    ),
                                    _actionButton(
                                      icon: _downloaded
                                          ? Icons.play_circle_filled
                                          : Icons.file_download,
                                      label:
                                          _downloaded ? 'Play' : 'Download',
                                      color: _downloaded
                                          ? Colors.blueAccent
                                          : null,
                                      onPressed: () => openRomOrInstall(
                                        rom['refid'] as int,
                                        downloaded: _downloaded,
                                      ),
                                    ),
                                    _actionButton(
                                      icon: Icons.share,
                                      label: 'Share',
                                      onPressed: () {},
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    Color? color,
  }) {
    return TextButton(
      onPressed: onPressed,
      child: SizedBox(
        height: 50,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Icon(icon, color: color ?? Colors.white70, size: 28),
            Text(label, style: const TextStyle(fontSize: 10)),
          ],
        ),
      ),
    );
  }
}
