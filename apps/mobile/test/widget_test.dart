import 'package:flutter_test/flutter_test.dart';
import 'package:tsukiyomi/config/api_config.dart';

void main() {
  test('ApiConfig builds image URLs', () {
    expect(
      ApiConfig.imageUrl(3),
      '${ApiConfig.baseUrl}/Images/image3.jpg',
    );
  });
}
