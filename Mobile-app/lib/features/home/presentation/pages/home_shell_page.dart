import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/core/localization/app_localizations.dart';
import 'package:massaye/core/widgets/app_drawer.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';
import 'package:massaye/features/chat/presentation/pages/conversations_list_page.dart';
import 'package:massaye/features/community/presentation/pages/community_feed_page.dart';
import 'package:massaye/features/consultation/presentation/pages/consultations_page.dart';
import 'package:massaye/features/education/presentation/pages/guide_library_page.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_history_page.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_scanner_page.dart';
import 'package:massaye/features/profile/presentation/pages/profile_page.dart';

class HomeShellPage extends StatefulWidget {
  const HomeShellPage({super.key});

  @override
  State<HomeShellPage> createState() => _HomeShellPageState();
}

class _HomeShellPageState extends State<HomeShellPage> {
  int _currentIndex = 0;

  void _showNotificationModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.65,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.mintGreenPill,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.notifications_active_rounded,
                              color: AppTheme.darkForest, size: 20),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'Farm Notifications',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.charcoalText,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: AppTheme.mutedOlive),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildNotificationItem(
                      icon: Icons.eco_rounded,
                      iconBg: const Color(0xFFECFDF5),
                      iconColor: const Color(0xFF059669),
                      title: 'Optimal Planting Weather',
                      description:
                          'Local soil moisture is at 82% in your kebele. Ideal time for tef and maize top-dressing.',
                      time: 'Just now',
                    ),
                    _buildNotificationItem(
                      icon: Icons.support_agent_rounded,
                      iconBg: const Color(0xFFFEF3C7),
                      iconColor: const Color(0xFFD97706),
                      title: 'Extension Officer Assigned',
                      description:
                          'Officer Abebe has been assigned to your consultation request.',
                      time: '2 hours ago',
                    ),
                    _buildNotificationItem(
                      icon: Icons.shield_outlined,
                      iconBg: const Color(0xFFEFF6FF),
                      iconColor: const Color(0xFF2563EB),
                      title: 'Rust Alert for Zone',
                      description:
                          'Early stripe rust reported in adjacent woreda. Inspect wheat foliage regularly.',
                      time: 'Yesterday',
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationItem({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required String description,
    required String time,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                    ),
                    Text(
                      time,
                      style: const TextStyle(fontSize: 11, color: AppTheme.mutedOlive),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final user = authState.user;

        final List<Widget> pages = [
          _buildDashboardTab(context, user, loc),
          const PredictionScannerPage(),
          const CommunityFeedPage(),
          const ConversationsListPage(),
          const ProfilePage(),
        ];

        return Scaffold(
          drawer: const AppDrawer(),
          backgroundColor: AppTheme.creamBackground,
          body: pages[_currentIndex],
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.home_rounded),
                label: loc?.translate('nav_home', fallback: 'Home') ?? 'Home',
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.document_scanner_rounded),
                label: loc?.translate('nav_scan', fallback: 'AI Scan') ?? 'AI Scan',
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.forum_rounded),
                label: loc?.translate('nav_community', fallback: 'Community') ?? 'Community',
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.chat_bubble_outline_rounded),
                label: loc?.translate('nav_consult', fallback: 'Consult') ?? 'Consult',
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.person_outline_rounded),
                label: loc?.translate('nav_profile', fallback: 'Profile') ?? 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDashboardTab(BuildContext context, dynamic user, AppLocalizations? loc) {
    final avatarUrl = AppConfig.resolveMediaUrl(user?.profileImage);

    return Scaffold(
      drawer: const AppDrawer(),
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: Builder(
          builder: (context) {
            if (Navigator.canPop(context)) {
              return IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
                onPressed: () => Navigator.pop(context),
                tooltip: 'Back',
              );
            }
            return IconButton(
              icon: const Icon(Icons.menu_rounded, color: AppTheme.charcoalText, size: 28),
              onPressed: () => Scaffold.of(context).openDrawer(),
              tooltip: 'Open Sidebar',
            );
          },
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(
                  'assets/images/massaye_logo.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user?.locationSummary ?? 'Tembaro Kebele 01',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.charcoalText,
                    ),
                  ),
                  const Text(
                    'Farmer Portal',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppTheme.darkForest,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // 1. Notification Button with Alert Badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                onPressed: () => _showNotificationModal(context),
                icon: const Icon(Icons.notifications_outlined, color: AppTheme.charcoalText, size: 24),
                tooltip: 'Notifications',
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),

          // 2. Chat Shortcut Button
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ConversationsListPage()),
              );
            },
            icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.charcoalText, size: 22),
            tooltip: 'Direct Messages',
          ),

          // 3. Scan History Button
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const PredictionHistoryPage(),
                ),
              );
            },
            icon: const Icon(Icons.history_rounded, color: AppTheme.charcoalText, size: 22),
            tooltip: 'Prediction History',
          ),

          // 4. Farmer Avatar
          InkWell(
            onTap: () => setState(() => _currentIndex = 4),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.darkForest,
              backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
              child: avatarUrl.isEmpty
                  ? Text(
                      user != null && user.firstName.isNotEmpty ? user.firstName[0].toUpperCase() : 'F',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    )
                  : null,
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Modern Agricultural Weather & Field Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF064E3B).withOpacity(0.25),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Good Day, ${user?.firstName ?? "Farmer"}!',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: const [
                              Icon(Icons.wb_sunny_rounded, color: Colors.amberAccent, size: 16),
                              SizedBox(width: 6),
                              Text(
                                '24°C • Optimal Crop Growing Index',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFFD1FAE5),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.eco_rounded,
                          size: 32,
                          color: Color(0xFF34D399),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildModernStatusPill(
                        icon: Icons.water_drop_outlined,
                        label: 'Humidity',
                        value: '68%',
                        bgColor: Colors.white.withOpacity(0.12),
                        textColor: Colors.white,
                      ),
                      _buildModernStatusPill(
                        icon: Icons.grass_rounded,
                        label: 'Soil Index',
                        value: 'Optimal',
                        bgColor: Colors.white.withOpacity(0.12),
                        textColor: const Color(0xFF34D399),
                      ),
                      _buildModernStatusPill(
                        icon: Icons.cloud_outlined,
                        label: 'Rain Risk',
                        value: '10%',
                        bgColor: Colors.white.withOpacity(0.12),
                        textColor: Colors.white,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Agricultural Operations',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.charcoalText,
              ),
            ),

            const SizedBox(height: 16),

            // 2x2 Grid Hub
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 0.95,
              children: [
                _buildGridCard(
                  title: loc?.translate('quick_ai_scan', fallback: 'AI Crop Diagnostic') ?? 'AI Crop Diagnostic',
                  subtitle: 'Real-time Leaf Scan',
                  icon: Icons.qr_code_scanner_rounded,
                  iconBg: AppTheme.mintGreenPill,
                  iconColor: AppTheme.mintGreenText,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _buildGridCard(
                  title: loc?.translate('quick_community', fallback: 'Farmers Community') ?? 'Farmers Community',
                  subtitle: 'Share & Advise',
                  icon: Icons.groups_rounded,
                  iconBg: AppTheme.skyBluePill,
                  iconColor: AppTheme.skyBlueText,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                _buildGridCard(
                  title: loc?.translate('quick_consult', fallback: 'Extension Officer') ?? 'Extension Officer',
                  subtitle: 'Request Consultation',
                  icon: Icons.support_agent_rounded,
                  iconBg: AppTheme.warmAmberPill,
                  iconColor: AppTheme.warmAmberText,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ConsultationsPage()),
                    );
                  },
                ),
                _buildGridCard(
                  title: loc?.translate('quick_education', fallback: 'Crop Knowledge') ?? 'Crop Knowledge',
                  subtitle: 'Library & Guides',
                  icon: Icons.menu_book_rounded,
                  iconBg: const Color(0xFFF3E5F5),
                  iconColor: const Color(0xFF7B1FA2),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const GuideLibraryPage()),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernStatusPill({
    required IconData icon,
    required String label,
    required String value,
    required Color bgColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: const Color(0xFFD1FAE5)),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: Color(0xFFD1FAE5), fontWeight: FontWeight.w500),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(fontSize: 13, color: textColor, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildGridCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.black.withOpacity(0.04)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: iconColor, size: 26),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.charcoalText,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.mutedOlive,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
