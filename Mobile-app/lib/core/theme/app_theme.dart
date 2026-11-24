import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors matching image1.png design system
  static const Color creamBackground = Color(0xFFF8F9F5);
  static const Color cardWhite = Color(0xFFFFFFFF);
  static const Color darkForest = Color(0xFF1C2A1E);
  static const Color darkForestHover = Color(0xFF2D4030);
  static const Color charcoalText = Color(0xFF1E2922);
  static const Color mutedOlive = Color(0xFF64746A);

  // Sunrise Warm Gradient Colors (Weather & Kebele Status Banner)
  static const Color sunriseStart = Color(0xFFFDE5C5);
  static const Color sunriseEnd = Color(0xFFFBD1A3);

  // Accent Pills & Badges
  static const Color mintGreenPill = Color(0xFFD6EEDD);
  static const Color mintGreenText = Color(0xFF1B5E20);
  static const Color warmAmberPill = Color(0xFFFBE8D5);
  static const Color warmAmberText = Color(0xFFE65100);
  static const Color skyBluePill = Color(0xFFE3F2FD);
  static const Color skyBlueText = Color(0xFF1565C0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: creamBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: darkForest,
        primary: darkForest,
        surface: creamBackground,
        onSurface: charcoalText,
      ),
      fontFamily: 'Roboto', // Modern, clean, geometric feel
      cardTheme: CardThemeData(
        color: cardWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.0),
          side: BorderSide(
            color: Colors.black.withOpacity(0.04),
            width: 1.0,
          ),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkForest,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30.0),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: creamBackground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: charcoalText),
        titleTextStyle: TextStyle(
          color: charcoalText,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: cardWhite,
        selectedItemColor: darkForest,
        unselectedItemColor: mutedOlive,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFF121814),
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: const Color(0xFF4CAF50),
        primary: const Color(0xFF81C784),
        surface: const Color(0xFF1E2620),
        onSurface: const Color(0xFFE8F5E9),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1E2620),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.0),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF81C784),
          foregroundColor: const Color(0xFF121814),
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30.0),
          ),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF121814),
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
