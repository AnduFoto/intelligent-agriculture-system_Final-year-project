import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_event.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';

class AppNavItem {
  final String label;
  final String route;
  final IconData icon;

  const AppNavItem({
    required this.label,
    required this.route,
    required this.icon,
  });
}

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  static const List<AppNavItem> farmerLinks = [
    AppNavItem(label: 'Home & Overview', route: '/', icon: Icons.home_rounded),
    AppNavItem(label: 'AI Crop Diagnostic', route: '/farmer/predict', icon: Icons.qr_code_scanner_rounded),
    AppNavItem(label: 'Scan History', route: '/farmer/predictions', icon: Icons.history_rounded),
    AppNavItem(label: 'Officer Consultations', route: '/farmer/consultations', icon: Icons.support_agent_rounded),
    AppNavItem(label: 'Knowledge Library', route: '/education/library', icon: Icons.menu_book_rounded),
    AppNavItem(label: 'Saved Guides', route: '/education/saved', icon: Icons.bookmark_rounded),
    AppNavItem(label: 'Direct Messaging', route: '/chat', icon: Icons.chat_bubble_outline_rounded),
    AppNavItem(label: 'Farm Analytics', route: '/farmer/reports', icon: Icons.bar_chart_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final user = authState.user;
        final avatarUrl = AppConfig.resolveMediaUrl(user?.profileImage);

        return Drawer(
          backgroundColor: const Color(0xFF09090B),
          child: Column(
            children: [
              // 1. BRAND HEADER (Emerald Accent)
              SafeArea(
                bottom: false,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: Color(0xFF18181B))),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF059669).withOpacity(0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.asset(
                            'assets/images/massaye_logo.png',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Massaye',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            'FARMER PORTAL',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF34D399),
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // 2. FARMER PROFILE BANNER
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFF059669),
                      backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                      child: avatarUrl.isEmpty
                          ? Text(
                              user != null && user.firstName.isNotEmpty
                                  ? user.firstName[0].toUpperCase()
                                  : 'F',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.fullName ?? 'Farmer',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF34D399).withOpacity(0.3)),
                            ),
                            child: const Text(
                              'Farmer',
                              style: TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'FARMER MENU',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF71717A),
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),

              // 3. NAVIGATION LINKS
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  itemCount: farmerLinks.length,
                  itemBuilder: (context, index) {
                    final item = farmerLinks[index];
                    final isActive = currentRoute == item.route;

                    return Container(
                      margin: const EdgeInsets.symmetric(vertical: 2),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF059669).withOpacity(0.15) : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isActive ? const Color(0xFF34D399).withOpacity(0.3) : Colors.transparent,
                        ),
                      ),
                      child: ListTile(
                        dense: true,
                        horizontalTitleGap: 10,
                        leading: Icon(
                          item.icon,
                          size: 20,
                          color: isActive ? const Color(0xFF34D399) : const Color(0xFFA1A1AA),
                        ),
                        title: Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                            color: isActive ? const Color(0xFF34D399) : const Color(0xFFE4E4E7),
                          ),
                        ),
                        onTap: () {
                          final route = item.route;
                          Navigator.pop(context);
                          Future.microtask(() {
                            if (context.mounted) {
                              context.go(route);
                            }
                          });
                        },
                      ),
                    );
                  },
                ),
              ),

              // 4. SIGN OUT BUTTON
              Container(
                padding: const EdgeInsets.all(14),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: Color(0xFF18181B))),
                ),
                child: InkWell(
                  onTap: () {
                    Navigator.pop(context);
                    context.read<AuthBloc>().add(LogoutRequestedEvent());
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF27272A).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF27272A)),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                        SizedBox(width: 12),
                        Text(
                          'Sign Out',
                          style: TextStyle(
                            color: Color(0xFFEF4444),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
