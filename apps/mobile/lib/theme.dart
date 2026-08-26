import 'package:flutter/material.dart';

/// Light match of the React onboarding portal (paper / forest green / serif titles).
const ink = Color(0xFF1C2430);
const muted = Color(0xFF5C6778);
const paper = Color(0xFFEEF3EF);
const cardFill = Color(0xFFFFFCF7);
const line = Color(0xFFCFD8D1);
const accent = Color(0xFF2F5D50);
const danger = Color(0xFF9A3B2F);

ThemeData hrisTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: accent,
      brightness: Brightness.light,
      primary: accent,
      surface: paper,
      onSurface: ink,
    ),
  );
  return base.copyWith(
    scaffoldBackgroundColor: paper,
    textTheme: base.textTheme.apply(bodyColor: ink, displayColor: ink).copyWith(
      headlineMedium: const TextStyle(
        fontFamily: 'serif',
        fontWeight: FontWeight.w600,
        color: ink,
        fontSize: 28,
        height: 1.2,
      ),
      titleLarge: const TextStyle(
        fontFamily: 'serif',
        fontWeight: FontWeight.w600,
        color: ink,
        fontSize: 22,
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: accent,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: ink,
        side: const BorderSide(color: line),
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    cardTheme: CardThemeData(
      color: cardFill,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: line),
      ),
    ),
  );
}
