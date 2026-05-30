import 'package:flutter/material.dart';
import 'package:tsukiyomi/config/api_config.dart';
import 'package:tsukiyomi/detail_page.dart';
import 'package:tsukiyomi/services/tsukiyomi_api.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.user});

  final Map<String, dynamic> user;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _api = TsukiyomiApi();
  List<dynamic> _recommended = [];

  @override
  void initState() {
    super.initState();
    _loadRecommended();
  }

  Future<void> _loadRecommended() async {
    final phone = widget.user['phone'].toString();
    final recommended = await _api.getRecommended(phone);
    if (!mounted) return;
    setState(() => _recommended = recommended);
  }

  int _historyLength() {
    final history = widget.user['user_history'];
    if (history is List) return history.length;
    return 0;
  }

  void _openDetail(int refId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => DetailPage(index: refId, user: widget.user),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final history = widget.user['user_history'] as List<dynamic>? ?? [];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0x990000), Colors.black],
          begin: Alignment.topCenter,
          end: Alignment(0, 0.3),
        ),
      ),
      child: ListView(
        children: [
          _sectionTitle('Recently Played'),
          SizedBox(
            height: 130,
            child: _historyLength() == 0
                ? _placeholderTile('Nothing Yet')
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: history.length,
                    itemBuilder: (context, index) {
                      final item = history[index] as Map<String, dynamic>;
                      return GestureDetector(
                        onTap: () => _openDetail(item['refid'] as int),
                        child: SizedBox(
                          width: 150,
                          child: Image.network(
                            '${item['thumbnail'] ?? item['thumnail']}',
                            fit: BoxFit.fitHeight,
                            errorBuilder: (_, __, ___) => _placeholderTile(''),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          _sectionTitle('Made For You'),
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _recommended.isEmpty ? 10 : _recommended.length,
              itemBuilder: (context, index) {
                final item = _recommended.isNotEmpty
                    ? _recommended[index] as Map<String, dynamic>?
                    : null;
                final refId = item?['refid'] as int? ?? index;
                return GestureDetector(
                  onTap: () => _openDetail(refId),
                  child: SizedBox(
                    width: 240,
                    child: Image.network(
                      ApiConfig.imageUrl(refId),
                      fit: BoxFit.fitHeight,
                      errorBuilder: (_, __, ___) => _placeholderTile(''),
                    ),
                  ),
                );
              },
            ),
          ),
          _sectionTitle('Popular & Trending'),
          SizedBox(
            height: 185,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 10,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () => _openDetail(index),
                  child: SizedBox(
                    width: 205,
                    child: Image.network(
                      ApiConfig.imageUrl(index),
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => _placeholderTile(''),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 50, 0, 0),
      height: 100,
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 40,
            fontFamily: 'Mozart',
          ),
        ),
      ),
    );
  }

  Widget _placeholderTile(String label) {
    return Container(
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/bg2.png'),
          fit: BoxFit.fitWidth,
          alignment: Alignment.topCenter,
        ),
      ),
      child: Center(
        child: Text(
          label,
          style: const TextStyle(
            backgroundColor: Colors.white70,
            fontSize: 30,
            fontWeight: FontWeight.bold,
            fontFamily: 'Mozart',
            color: Colors.black,
          ),
        ),
      ),
    );
  }
}
