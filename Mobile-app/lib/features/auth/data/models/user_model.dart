import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final int id;
  final String email;
  final String firstName;
  final String? middleName;
  final String lastName;
  final String fullName;
  final String? phoneNumber;
  final String role;
  final String status;
  final String languagePreference;
  final String? profileImage;
  final String? regionName;
  final String? zoneName;
  final String? woredaName;
  final String? specialWoredaName;
  final String? kebeleName;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    this.middleName,
    required this.lastName,
    required this.fullName,
    this.phoneNumber,
    required this.role,
    required this.status,
    required this.languagePreference,
    this.profileImage,
    this.regionName,
    this.zoneName,
    this.woredaName,
    this.specialWoredaName,
    this.kebeleName,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final fName = json['first_name'] ?? '';
    final lName = json['last_name'] ?? '';
    final computedName = json['full_name'] ?? '$fName $lName'.trim();

    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      firstName: fName,
      middleName: json['middle_name'],
      lastName: lName,
      fullName: computedName.isEmpty ? (json['email'] ?? '') : computedName,
      phoneNumber: json['phone_number'],
      role: json['role'] ?? 'FARMER',
      status: json['status'] ?? 'ACTIVE',
      languagePreference: json['language_preference'] ?? 'EN',
      profileImage: json['profile_image'],
      regionName: json['region_name'],
      zoneName: json['zone_name'],
      woredaName: json['woreda_name'],
      specialWoredaName: json['special_woreda_name'],
      kebeleName: json['kebele_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'middle_name': middleName,
      'last_name': lastName,
      'full_name': fullName,
      'phone_number': phoneNumber,
      'role': role,
      'status': status,
      'language_preference': languagePreference,
      'profile_image': profileImage,
      'region_name': regionName,
      'zone_name': zoneName,
      'woreda_name': woredaName,
      'special_woreda_name': specialWoredaName,
      'kebele_name': kebeleName,
    };
  }

  String get locationSummary {
    if (kebeleName != null && kebeleName!.isNotEmpty) {
      if (specialWoredaName != null && specialWoredaName!.isNotEmpty) {
        return '$kebeleName, $specialWoredaName';
      }
      if (woredaName != null && woredaName!.isNotEmpty) {
        return '$kebeleName, $woredaName';
      }
      return kebeleName!;
    }
    if (woredaName != null) return woredaName!;
    if (regionName != null) return regionName!;
    return 'Location Pending';
  }

  String get roleDisplay => 'Farmer';

  @override
  List<Object?> get props => [
        id,
        email,
        firstName,
        middleName,
        lastName,
        role,
        status,
        languagePreference,
        profileImage,
        kebeleName,
      ];
}
