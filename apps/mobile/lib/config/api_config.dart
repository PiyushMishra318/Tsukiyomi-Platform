class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'TSUKIYOMI_API_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static String imageUrl(int refId) => '$baseUrl/Images/image$refId.jpg';

  static Uri uri(String path) => Uri.parse('$baseUrl/api$path');
}
