import 'package:flutter/material.dart';
import 'package:tsukiyomi/services/tsukiyomi_api.dart';

class BrowsePage extends StatefulWidget {
  const BrowsePage({super.key, required this.user});

  final Map<String, dynamic> user;

  @override
  State<BrowsePage> createState() => _BrowsePageState();
}

class _BrowsePageState extends State<BrowsePage> {
  final _api = TsukiyomiApi();
  List<dynamic> _genres = const [{'name': 'Loading'}];

  @override
  void initState() {
    super.initState();
    _loadGenres();
  }

  Future<void> _loadGenres() async {
    final genres = await _api.getGenres();
    if (!mounted) return;
    setState(() => _genres = genres);
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.sizeOf(context).width;
    final userGenres = widget.user['genres'] as List<dynamic>? ?? [];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0x990000), Colors.black],
          begin: Alignment.bottomCenter,
          end: Alignment(0, 0.3),
        ),
      ),
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 30),
          const Text(
            'Search',
            style: TextStyle(
              color: Colors.white,
              fontSize: 45,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          Card(
            child: SizedBox(
              width: screenWidth - 30,
              height: 50,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search, color: Colors.black),
                  Text(
                    'Genre, Games or Titles',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Your Top Genres',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          _genreGrid(userGenres.map((g) => g.toString()).toList()),
          const SizedBox(height: 20),
          const Text(
            'Browse All',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          _genreGrid(
            _genres
                .map((g) => (g as Map<String, dynamic>)['name'].toString())
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _genreGrid(List<String> labels) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: labels.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
      ),
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.all(10),
          child: Card(
            clipBehavior: Clip.antiAlias,
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/bg2.png'),
                  fit: BoxFit.fitWidth,
                  alignment: Alignment.topCenter,
                ),
              ),
              child: Center(
                child: Text(
                  labels[index],
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    backgroundColor: Colors.white70,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Mozart',
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
