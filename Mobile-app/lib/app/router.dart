import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';
import 'package:massaye/features/auth/presentation/pages/login_page.dart';
import 'package:massaye/features/auth/presentation/pages/register_page.dart';
import 'package:massaye/features/chat/presentation/pages/conversations_list_page.dart';
import 'package:massaye/features/consultation/presentation/pages/consultations_page.dart';
import 'package:massaye/features/consultation/presentation/pages/request_consultation_page.dart';
import 'package:massaye/features/education/presentation/pages/guide_library_page.dart';
import 'package:massaye/features/home/presentation/pages/home_shell_page.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_history_page.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_scanner_page.dart';
import 'package:massaye/features/reports/presentation/pages/reports_dashboard_page.dart';

GoRouter createRouter(AuthBloc authBloc) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (BuildContext context, GoRouterState state) {
      final authState = authBloc.state;
      final isLoggingIn = state.matchedLocation == '/login';
      final isRegistering = state.matchedLocation == '/register';

      if (authState.status == AuthStatus.unauthenticated ||
          authState.status == AuthStatus.error) {
        return (isLoggingIn || isRegistering) ? null : '/login';
      }

      if (authState.status == AuthStatus.authenticated && (isLoggingIn || isRegistering)) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeShellPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/farmer/dashboard',
        builder: (context, state) => const HomeShellPage(),
      ),
      GoRoute(
        path: '/farmer/predict',
        builder: (context, state) => const PredictionScannerPage(),
      ),
      GoRoute(
        path: '/farmer/predictions',
        builder: (context, state) => const PredictionHistoryPage(),
      ),
      GoRoute(
        path: '/farmer/consultations',
        builder: (context, state) => const ConsultationsPage(),
      ),
      GoRoute(
        path: '/farmer/consultations/new',
        builder: (context, state) => const RequestConsultationPage(),
      ),
      GoRoute(
        path: '/education/library',
        builder: (context, state) => const GuideLibraryPage(),
      ),
      GoRoute(
        path: '/education/saved',
        builder: (context, state) => const GuideLibraryPage(),
      ),
      GoRoute(
        path: '/farmer/reports',
        builder: (context, state) => const ReportsDashboardPage(),
      ),
      GoRoute(
        path: '/chat',
        builder: (context, state) => const ConversationsListPage(),
      ),
    ],
  );
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
          (dynamic _) => notifyListeners(),
        );
  }

  late final dynamic _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
