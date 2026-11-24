import 'package:equatable/equatable.dart';
import 'package:massaye/features/auth/data/models/user_model.dart';

enum AuthStatus { unknown, authenticated, unauthenticated, loading, error }

class AuthState extends Equatable {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  factory AuthState.unknown() => const AuthState(status: AuthStatus.unknown);
  factory AuthState.unauthenticated() => const AuthState(status: AuthStatus.unauthenticated);
  factory AuthState.loading() => const AuthState(status: AuthStatus.loading);
  factory AuthState.authenticated(UserModel user) => AuthState(status: AuthStatus.authenticated, user: user);
  factory AuthState.error(String message) => AuthState(status: AuthStatus.error, errorMessage: message);

  @override
  List<Object?> get props => [status, user, errorMessage];
}
