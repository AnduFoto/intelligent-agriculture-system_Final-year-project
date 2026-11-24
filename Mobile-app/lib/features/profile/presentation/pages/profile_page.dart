import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/core/localization/app_localizations.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_event.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        title: Text(loc?.translate('nav_profile', fallback: 'My Profile') ?? 'My Profile'),
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          final user = state.user;
          if (user == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final avatarUrl = AppConfig.resolveMediaUrl(user.profileImage);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                // ==========================================
                // 1. PROFILE HEADER CARD
                // ==========================================
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    color: AppTheme.cardWhite,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: Colors.black.withOpacity(0.04)),
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 42,
                        backgroundColor: AppTheme.mintGreenPill,
                        backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                        child: avatarUrl.isEmpty
                            ? Text(
                                user.firstName.isNotEmpty ? user.firstName[0].toUpperCase() : 'U',
                                style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.darkForest,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user.fullName,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.mutedOlive,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.mintGreenPill,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          user.role,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.mintGreenText,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // ==========================================
                // 2. LOCATION & ASSIGNMENT DETAILS CARD
                // ==========================================
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    color: AppTheme.cardWhite,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.black.withOpacity(0.04)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Location & Organization',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                      const Divider(height: 24),
                      _buildInfoRow(
                        icon: Icons.location_on_outlined,
                        title: 'Kebele Location',
                        value: user.locationSummary,
                      ),
                      if (user.phoneNumber != null && user.phoneNumber!.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        _buildInfoRow(
                          icon: Icons.phone_outlined,
                          title: 'Phone Number',
                          value: user.phoneNumber!,
                        ),
                      ],
                      const SizedBox(height: 14),
                      _buildInfoRow(
                        icon: Icons.verified_user_outlined,
                        title: 'Account Status',
                        value: user.status,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // ==========================================
                // 3. LOGOUT BUTTON
                // ==========================================
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton(
                    onPressed: () {
                      context.read<AuthBloc>().add(LogoutRequestedEvent());
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.logout_rounded, color: Colors.red),
                        const SizedBox(width: 10),
                        Text(
                          loc?.translate('logout', fallback: 'Sign Out') ?? 'Sign Out',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.creamBackground,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppTheme.darkForest, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.mutedOlive,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.charcoalText,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
