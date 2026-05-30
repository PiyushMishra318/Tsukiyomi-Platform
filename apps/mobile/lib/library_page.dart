import 'package:flutter/material.dart';
import 'package:tsukiyomi/config/api_config.dart';
import 'package:tsukiyomi/detail_page.dart';
import 'package:tsukiyomi/services/tsukiyomi_api.dart';

class LibraryPage extends StatefulWidget {
  const LibraryPage({super.key, required this.user});

  final Map<String, dynamic> user;

  @override
  State<LibraryPage> createState() => _LibraryPageState();
}

class _LibraryPageState extends State<LibraryPage> {
  final _api = TsukiyomiApi();
  Map<String, dynamic> _userDetails = {'favorites': [], 'downloads': []};

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final phone = widget.user['phone'].toString();
    final user = await _api.getUser(phone);
    if (!mounted || user == null) return;
    setState(() => _userDetails = user);
  }

  @override
  Widget build(BuildContext context) {
    final favorites = _userDetails['favorites'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          'Library',
          style: TextStyle(fontSize: 40, fontFamily: 'Mozart'),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: GridView.builder(
          itemCount: favorites.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
          ),
          itemBuilder: (context, index) {
            final item = favorites[index] as Map<String, dynamic>;
            final refId = item['refid'] as int;
            return Padding(
              padding: const EdgeInsets.all(10),
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) =>
                          DetailPage(index: refId, user: widget.user),
                    ),
                  );
                },
                child: Card(
                  clipBehavior: Clip.antiAlias,
                  child: Image.network(
                    ApiConfig.imageUrl(refId),
                    fit: BoxFit.fitHeight,
                    errorBuilder: (_, __, ___) =>
                        const Center(child: Icon(Icons.videogame_asset)),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
