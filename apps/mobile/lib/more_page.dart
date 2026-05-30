import 'package:flutter/material.dart';

class MorePage extends StatelessWidget {
  const MorePage({super.key, required this.user});

  final Map<String, dynamic> user;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        'More',
        style: Theme.of(context).textTheme.headlineMedium,
      ),
    );
  }
}
