import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/auth/data/repositories/auth_repository.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isPasswordVisible = false;
  bool _isLoading = false;
  bool _isLocationsLoading = true;
  String? _errorMessage;
  String? _successMessage;

  List<dynamic> _regionsTree = [];
  Map<String, dynamic>? _selectedRegion;
  Map<String, dynamic>? _selectedZone;
  Map<String, dynamic>? _selectedWoreda;
  Map<String, dynamic>? _selectedKebele;

  List<dynamic> _availableZones = [];
  List<dynamic> _availableWoredas = [];
  List<dynamic> _availableKebeles = [];

  @override
  void initState() {
    super.initState();
    _loadLocationsTree();
  }

  Future<void> _loadLocationsTree() async {
    final repo = context.read<AuthRepository>();
    final tree = await repo.getLocationsTree();
    if (mounted) {
      setState(() {
        _regionsTree = tree;
        _isLocationsLoading = false;
      });
    }
  }

  void _onRegionChanged(Map<String, dynamic>? region) {
    setState(() {
      _selectedRegion = region;
      _selectedZone = null;
      _selectedWoreda = null;
      _selectedKebele = null;

      _availableZones = region != null ? (region['zones'] as List? ?? []) : [];
      _availableWoredas = [];
      _availableKebeles = [];
    });
  }

  void _onZoneChanged(Map<String, dynamic>? zone) {
    setState(() {
      _selectedZone = zone;
      _selectedWoreda = null;
      _selectedKebele = null;

      _availableWoredas = zone != null ? (zone['woredas'] as List? ?? []) : [];
      _availableKebeles = [];
    });
  }

  void _onWoredaChanged(Map<String, dynamic>? woreda) {
    setState(() {
      _selectedWoreda = woreda;
      _selectedKebele = null;

      _availableKebeles = woreda != null ? (woreda['kebeles'] as List? ?? []) : [];
    });
  }

  void _onKebeleChanged(Map<String, dynamic>? kebele) {
    setState(() {
      _selectedKebele = kebele;
    });
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedRegion == null) {
      setState(() => _errorMessage = 'Please select a Region.');
      return;
    }
    if (_selectedKebele == null) {
      setState(() => _errorMessage = 'Please select a Kebele.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final repo = context.read<AuthRepository>();
    try {
      final msg = await repo.registerFarmer(
        firstName: _firstNameController.text,
        middleName: _middleNameController.text,
        lastName: _lastNameController.text,
        email: _emailController.text,
        phoneNumber: _phoneController.text,
        password: _passwordController.text,
        confirmPassword: _confirmPasswordController.text,
        regionId: _selectedRegion!['id'],
        zoneId: _selectedZone?['id'],
        woredaId: _selectedWoreda?['id'],
        kebeleId: _selectedKebele!['id'],
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
          _successMessage = msg;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => context.go('/login'),
        ),
        title: const Text(
          'Farmer Registration',
          style: TextStyle(color: AppTheme.charcoalText, fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Role Info Badge
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFA5D6A7)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, color: AppTheme.darkForest),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Farmer Account Registration',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.darkForest,
                                fontSize: 14,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Self-registration creates Farmer profiles. Agriculture Officers & Admins are onboarded directly by system administrators.',
                              style: TextStyle(fontSize: 12, color: AppTheme.charcoalText),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Error / Success Banners
                if (_errorMessage != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
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
                            _errorMessage!,
                            style: const TextStyle(color: Color(0xFFC62828), fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                if (_successMessage != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFA5D6A7)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, color: AppTheme.darkForest),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _successMessage!,
                                style: const TextStyle(
                                  color: AppTheme.darkForest,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => context.go('/login'),
                            child: const Text('Go to Login'),
                          ),
                        ),
                      ],
                    ),
                  ),

                // 2. Personal Info Fields
                const Text('First Name *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _firstNameController,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter first name' : null,
                  decoration: _buildInputDecoration('e.g. Abebe', Icons.person_outline),
                ),
                const SizedBox(height: 14),

                const Text('Middle Name', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _middleNameController,
                  decoration: _buildInputDecoration('e.g. Kebede', Icons.person_outline),
                ),
                const SizedBox(height: 14),

                const Text('Last Name *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _lastNameController,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter last name' : null,
                  decoration: _buildInputDecoration('e.g. Tessema', Icons.person_outline),
                ),
                const SizedBox(height: 14),

                const Text('Email Address *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Enter valid email' : null,
                  decoration: _buildInputDecoration('e.g. farmer@gmail.com', Icons.email_outlined),
                ),
                const SizedBox(height: 14),

                const Text('Phone Number *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter phone number' : null,
                  decoration: _buildInputDecoration('e.g. +251911223344', Icons.phone_outlined),
                ),
                const SizedBox(height: 18),

                // 3. Location Dropdowns
                const Text('Location Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.darkForest)),
                const SizedBox(height: 12),

                if (_isLocationsLoading)
                  const Center(child: CircularProgressIndicator())
                else ...[
                  // Region
                  DropdownButtonFormField<Map<String, dynamic>>(
                    value: _selectedRegion,
                    decoration: _buildInputDecoration('Select Region *', Icons.map_outlined),
                    items: _regionsTree.map((r) {
                      return DropdownMenuItem<Map<String, dynamic>>(
                        value: r as Map<String, dynamic>,
                        child: Text(r['name'] ?? ''),
                      );
                    }).toList(),
                    onChanged: _onRegionChanged,
                  ),
                  const SizedBox(height: 14),

                  // Zone
                  if (_availableZones.isNotEmpty) ...[
                    DropdownButtonFormField<Map<String, dynamic>>(
                      value: _selectedZone,
                      decoration: _buildInputDecoration('Select Zone', Icons.location_city_outlined),
                      items: _availableZones.map((z) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: z as Map<String, dynamic>,
                          child: Text(z['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: _onZoneChanged,
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Woreda
                  if (_availableWoredas.isNotEmpty) ...[
                    DropdownButtonFormField<Map<String, dynamic>>(
                      value: _selectedWoreda,
                      decoration: _buildInputDecoration('Select Woreda', Icons.navigation_outlined),
                      items: _availableWoredas.map((w) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: w as Map<String, dynamic>,
                          child: Text(w['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: _onWoredaChanged,
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Kebele
                  if (_availableKebeles.isNotEmpty) ...[
                    DropdownButtonFormField<Map<String, dynamic>>(
                      value: _selectedKebele,
                      decoration: _buildInputDecoration('Select Kebele *', Icons.home_work_outlined),
                      items: _availableKebeles.map((k) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: k as Map<String, dynamic>,
                          child: Text(k['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: _onKebeleChanged,
                    ),
                    const SizedBox(height: 14),
                  ],
                ],

                const SizedBox(height: 18),

                // 4. Passwords
                const Text('Password *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _passwordController,
                  obscureText: !_isPasswordVisible,
                  validator: (v) => (v == null || v.length < 8) ? 'Password must be at least 8 characters' : null,
                  decoration: _buildInputDecoration('••••••••', Icons.lock_outline_rounded).copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(_isPasswordVisible ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                      onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                const Text('Confirm Password *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: !_isPasswordVisible,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Confirm your password';
                    if (v != _passwordController.text) return 'Passwords do not match';
                    return null;
                  },
                  decoration: _buildInputDecoration('••••••••', Icons.lock_outline_rounded),
                ),
                const SizedBox(height: 28),

                // 5. Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submitRegister,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Create Farmer Account', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, color: AppTheme.mutedOlive),
      filled: true,
      fillColor: AppTheme.cardWhite,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppTheme.darkForest, width: 2),
      ),
    );
  }
}
