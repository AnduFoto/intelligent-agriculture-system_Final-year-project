import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:massaye/app/router.dart';
import 'package:massaye/core/localization/app_localizations.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/core/storage/secure_storage_service.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/auth/data/repositories/auth_repository.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_event.dart';
import 'package:massaye/features/chat/data/repositories/chat_repository.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:massaye/features/community/data/repositories/community_repository.dart';
import 'package:massaye/features/community/presentation/bloc/community_bloc.dart';
import 'package:massaye/features/consultation/data/repositories/consultation_repository.dart';
import 'package:massaye/features/education/data/repositories/education_repository.dart';
import 'package:massaye/features/prediction/data/repositories/prediction_repository.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_bloc.dart';

class MassayeApp extends StatefulWidget {
  const MassayeApp({super.key});

  @override
  State<MassayeApp> createState() => _MassayeAppState();
}

class _MassayeAppState extends State<MassayeApp> {
  late final SecureStorageService _storage;
  late final DioClient _dioClient;
  late final AuthRepository _authRepository;
  late final PredictionRepository _predictionRepository;
  late final CommunityRepository _communityRepository;
  late final ChatRepository _chatRepository;
  late final ConsultationRepository _consultationRepository;
  late final EducationRepository _educationRepository;

  late final AuthBloc _authBloc;
  late final PredictionBloc _predictionBloc;
  late final CommunityBloc _communityBloc;
  late final ChatBloc _chatBloc;

  @override
  void initState() {
    super.initState();
    _storage = SecureStorageService();
    _dioClient = DioClient(storage: _storage);
    _authRepository = AuthRepository(dioClient: _dioClient, storage: _storage);
    _predictionRepository = PredictionRepository(dioClient: _dioClient);
    _communityRepository = CommunityRepository(dioClient: _dioClient);
    _chatRepository = ChatRepository(dioClient: _dioClient);
    _consultationRepository = ConsultationRepository(dioClient: _dioClient);
    _educationRepository = EducationRepository(dioClient: _dioClient);

    _authBloc = AuthBloc(authRepository: _authRepository)..add(AppStartedEvent());
    _predictionBloc = PredictionBloc(predictionRepository: _predictionRepository);
    _communityBloc = CommunityBloc(communityRepository: _communityRepository);
    _chatBloc = ChatBloc(chatRepository: _chatRepository);
  }

  @override
  void dispose() {
    _authBloc.close();
    _predictionBloc.close();
    _communityBloc.close();
    _chatBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final router = createRouter(_authBloc);

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: _storage),
        RepositoryProvider.value(value: _dioClient),
        RepositoryProvider.value(value: _authRepository),
        RepositoryProvider.value(value: _predictionRepository),
        RepositoryProvider.value(value: _communityRepository),
        RepositoryProvider.value(value: _chatRepository),
        RepositoryProvider.value(value: _consultationRepository),
        RepositoryProvider.value(value: _educationRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider.value(value: _authBloc),
          BlocProvider.value(value: _predictionBloc),
          BlocProvider.value(value: _communityBloc),
          BlocProvider.value(value: _chatBloc),
        ],
        child: MaterialApp.router(
          title: 'Massaye',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          routerConfig: router,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', 'US'),
            Locale('am', 'ET'),
          ],
        ),
      ),
    );
  }
}
