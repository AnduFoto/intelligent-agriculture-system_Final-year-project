import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/features/auth/data/repositories/auth_repository.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_event.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthState.unknown()) {
    on<AppStartedEvent>(_onAppStarted);
    on<LoginSubmittedEvent>(_onLoginSubmitted);
    on<LogoutRequestedEvent>(_onLogoutRequested);
  }

  Future<void> _onAppStarted(AppStartedEvent event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      final user = await authRepository.checkAuthStatus();
      if (user != null) {
        emit(AuthState.authenticated(user));
      } else {
        emit(AuthState.unauthenticated());
      }
    } catch (_) {
      emit(AuthState.unauthenticated());
    }
  }

  Future<void> _onLoginSubmitted(LoginSubmittedEvent event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    try {
      final user = await authRepository.login(
        email: event.email,
        password: event.password,
      );
      emit(AuthState.authenticated(user));
    } catch (e) {
      emit(AuthState.error(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequestedEvent event, Emitter<AuthState> emit) async {
    emit(AuthState.loading());
    await authRepository.logout();
    emit(AuthState.unauthenticated());
  }
}
