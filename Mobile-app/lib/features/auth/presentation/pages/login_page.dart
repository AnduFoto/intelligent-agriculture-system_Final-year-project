import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/core/localization/app_localizations.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_event.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submitLogin() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            LoginSubmittedEvent(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),

                // ==========================================
                // 1. BRAND HEADER BANNER (Sunrise Accent)
                // ==========================================
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    gradient: const LinearGradient(
                      colors: [AppTheme.sunriseStart, AppTheme.sunriseEnd],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.orange.withOpacity(0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.asset(
                            'assets/images/massaye_logo.png',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        loc?.translate('app_name', fallback: 'Massaye') ?? 'Massaye',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        loc?.translate('welcome_title', fallback: 'The next generation of farming') ??
                            'The next generation of farming',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                const Text(
                  'Farmer Portal Login',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.charcoalText,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Sign in to access your crop disease scanner, officer consultations, and guides.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.mutedOlive,
                  ),
                ),

                const SizedBox(height: 24),

                // Error alert card
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) {
                    if (state.status == AuthStatus.error && state.errorMessage != null) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEBEE),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFFCDD2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, color: Colors.red),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                state.errorMessage!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFFC62828),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),

                // ==========================================
                // 2. EMAIL INPUT CARD
                // ==========================================
                Text(
                  loc?.translate('email', fallback: 'Email Address') ?? 'Email Address',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.charcoalText,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your email address.';
                    }
                    if (!value.contains('@')) {
                      return 'Please enter a valid email address.';
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    hintText: 'e.g. farmer@massaye.et',
                    prefixIcon: const Icon(Icons.email_outlined, color: AppTheme.mutedOlive),
                    filled: true,
                    fillColor: AppTheme.cardWhite,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: const BorderSide(color: AppTheme.darkForest, width: 2),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // ==========================================
                // 3. PASSWORD INPUT CARD
                // ==========================================
                Text(
                  loc?.translate('password', fallback: 'Password') ?? 'Password',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.charcoalText,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  obscureText: !_isPasswordVisible,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password.';
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppTheme.mutedOlive),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: AppTheme.mutedOlive,
                      ),
                      onPressed: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                    ),
                    filled: true,
                    fillColor: AppTheme.cardWhite,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: const BorderSide(color: AppTheme.darkForest, width: 2),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // ==========================================
                // 4. SUBMIT BUTTON
                // ==========================================
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) {
                    final isLoading = state.status == AuthStatus.loading;
                    return SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _submitLogin,
                        child: isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(loc?.translate('login_button', fallback: 'Login to Massaye') ?? 'Login to Massaye'),
                                  const SizedBox(width: 10),
                                  const Icon(Icons.arrow_forward_rounded, size: 20),
                                ],
                              ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // Register Prompt
                Center(
                  child: Column(
                    children: [
                      const Text(
                        "Don't have a Farmer account?",
                        style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.mutedOlive,
                        ),
                      ),
                      const SizedBox(height: 4),
                      TextButton(
                        onPressed: () => context.push('/register'),
                        child: const Text(
                          'Register as a Farmer',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.darkForest,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
