import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/authService';
import { useLocationTree } from '../hooks/useLocationTree';
import Button from '../components/ui/Button';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

function RegistrationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    regions,
    isLoading: locationsLoading,
    error: locationsError,
    getZonesForRegion,
    getSpecialWoredasForRegion,
    getWoredasForZone,
    getKebelesForWoreda,
    getKebelesForSpecialWoreda,
  } = useLocationTree();

  const [adminType, setAdminType] = useState(ADMIN_TYPE_ZONE);
  const [serverErrors, setServerErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirm_password: '',
      region: '',
      zone: '',
      woreda: '',
      special_woreda: '',
      kebele: '',
      language_preference: 'EN',
    },
  });

  const selectedRegion = watch('region');
  const selectedZone = watch('zone');
  const selectedWoreda = watch('woreda');
  const selectedSpecialWoreda = watch('special_woreda');

  const zones = selectedRegion ? getZonesForRegion(selectedRegion) : [];
  const specialWoredas = selectedRegion ? getSpecialWoredasForRegion(selectedRegion) : [];
  const woredas = selectedRegion && selectedZone ? getWoredasForZone(selectedRegion, selectedZone) : [];

  const kebeles =
    adminType === ADMIN_TYPE_ZONE
      ? (selectedRegion && selectedZone && selectedWoreda
          ? getKebelesForWoreda(selectedRegion, selectedZone, selectedWoreda)
          : [])
      : (selectedRegion && selectedSpecialWoreda
          ? getKebelesForSpecialWoreda(selectedRegion, selectedSpecialWoreda)
          : []);

  const handleRegionChange = () => {
    resetField('zone');
    resetField('woreda');
    resetField('special_woreda');
    resetField('kebele');
  };

  const handleAdminTypeChange = (type) => {
    setAdminType(type);
    resetField('kebele');
    if (type === ADMIN_TYPE_ZONE) {
      resetField('special_woreda');
    } else {
      resetField('zone');
      resetField('woreda');
    }
  };

  const onSubmit = async (data) => {
    setServerErrors(null);
    setIsSubmitting(true);

    const payload = {
      ...data,
      zone: adminType === ADMIN_TYPE_ZONE ? data.zone : null,
      woreda: adminType === ADMIN_TYPE_ZONE ? data.woreda : null,
      special_woreda: adminType === ADMIN_TYPE_SPECIAL_WOREDA ? data.special_woreda : null,
    };

    try {
      const response = await authService.register(payload);
      setSuccessMessage(response.data.message);
    } catch (err) {
      if (err.response?.data?.errors) {
        setServerErrors(err.response.data.errors);
      } else {
        setServerErrors({ non_field_errors: [err.response?.data?.detail || t('registration_failed', 'Registration failed. Please try again.')] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-accent-200 selection:text-primary-900 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-8 text-center shadow-soft dark:shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('registration_success', 'Registration Successful')}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{successMessage}</p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-xs sm:text-sm"
          >
            {t('go_to_login', 'Go to Login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-accent-200 selection:text-primary-900 relative transition-colors duration-300">
      
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-[140px] pointer-events-none rounded-full hidden dark:block" />

      {/* CONTAINER */}
      <div className="max-w-5xl w-full bg-white dark:bg-zinc-900/90 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-6 lg:p-10 shadow-soft dark:shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* HEADER */}
        <div className="mb-6 text-center shrink-0">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 inline-block mb-2">
            {t('farmer_onboarding', 'Farmer Portal Onboarding')}
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('create_account', 'Create an Account')}
          </h1>
        </div>

        {/* SERVER LEVEL NON-FIELD ERRORS */}
        {serverErrors?.non_field_errors && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5">
            <svg className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{serverErrors.non_field_errors.join(' ')}</span>
          </div>
        )}

        {/* FORM GRID */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* SIDE 1: PERSONAL DETAILS */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400 border-b border-slate-200 dark:border-zinc-800/80 pb-2">
              1. {t('personal_details', 'Personal Details')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('first_name', 'First Name')} error={errors.first_name?.message || serverErrors?.first_name?.[0]}>
                <input {...register('first_name', { required: t('req_first_name', 'First name is required') })} className={inputClass} placeholder="John" />
              </Field>

              <Field label={t('last_name', 'Last Name')} error={errors.last_name?.message || serverErrors?.last_name?.[0]}>
                <input {...register('last_name', { required: t('req_last_name', 'Last name is required') })} className={inputClass} placeholder="Doe" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('middle_name', 'Middle Name (optional)')} error={serverErrors?.middle_name?.[0]}>
                <input {...register('middle_name')} className={inputClass} placeholder="Abebe" />
              </Field>

              <Field label={t('phone_number', 'Phone Number')} error={errors.phone_number?.message || serverErrors?.phone_number?.[0]}>
                <input
                  {...register('phone_number', { required: t('req_phone', 'Phone number is required') })}
                  placeholder="+251912345678"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={t('email_address', 'Email Address')} error={errors.email?.message || serverErrors?.email?.[0]}>
              <input
                type="email"
                {...register('email', { required: t('req_email', 'Email is required') })}
                className={inputClass}
                placeholder="farmer@example.com"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('password', 'Password')} error={errors.password?.message || serverErrors?.password?.[0]}>
                <input
                  type="password"
                  {...register('password', { required: t('req_password', 'Password is required') })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>

              <Field label={t('confirm_password', 'Confirm Password')} error={errors.confirm_password?.message || serverErrors?.confirm_password?.[0]}>
                <input
                  type="password"
                  {...register('confirm_password', { required: t('req_confirm', 'Please confirm your password') })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
            </div>

            <Field label={t('language_preference', 'Language Preference')}>
              <select {...register('language_preference')} className={inputClass}>
                <option value="EN">English</option>
                <option value="AM">Amharic (አማርኛ)</option>
              </select>
            </Field>
          </div>

          {/* SIDE 2: LOCATION */}
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400 border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                2. {t('geographic_location', 'Geographic Location')}
              </h2>

              {locationsLoading && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  <span>{t('loading_locations', 'Loading locations...')}</span>
                </div>
              )}

              {locationsError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs">
                  {locationsError}
                </div>
              )}

              {!locationsLoading && !locationsError && (
                <div className="space-y-3.5">
                  <Field label={t('region', 'Region')} error={errors.region?.message || serverErrors?.region?.[0]}>
                    <select
                      {...register('region', { required: t('req_region', 'Region is required'), onChange: handleRegionChange })}
                      className={inputClass}
                    >
                      <option value="">{t('select_region', 'Select Region')}</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </Field>

                  {selectedRegion && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-300 uppercase tracking-wider block">
                        {t('admin_unit_type', 'Administrative Unit Type')}
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleAdminTypeChange(ADMIN_TYPE_ZONE)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            adminType === ADMIN_TYPE_ZONE
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Zone / Woreda
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminTypeChange(ADMIN_TYPE_SPECIAL_WOREDA)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            adminType === ADMIN_TYPE_SPECIAL_WOREDA
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Special Woreda
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRegion && adminType === ADMIN_TYPE_ZONE && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('zone', 'Zone')} error={errors.zone?.message || serverErrors?.zone?.[0]}>
                        <select
                          {...register('zone', {
                            required: t('req_zone', 'Zone is required'),
                            onChange: () => { resetField('woreda'); resetField('kebele'); },
                          })}
                          className={inputClass}
                        >
                          <option value="">{t('select_zone', 'Select Zone')}</option>
                          {zones.map((z) => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                          ))}
                        </select>
                      </Field>

                      {selectedZone ? (
                        <Field label={t('woreda', 'Woreda')} error={errors.woreda?.message || serverErrors?.woreda?.[0]}>
                          <select
                            {...register('woreda', {
                              required: t('req_woreda', 'Woreda is required'),
                              onChange: () => resetField('kebele'),
                            })}
                            className={inputClass}
                          >
                            <option value="">{t('select_woreda', 'Select Woreda')}</option>
                            {woredas.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </Field>
                      ) : (
                        <div className="flex flex-col justify-end">
                          <div className="h-[38px] border border-slate-200 dark:border-zinc-800/40 bg-slate-50 dark:bg-zinc-950/30 rounded-xl flex items-center px-3 text-xs text-slate-400 dark:text-zinc-600 italic">
                            Select Zone first
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRegion && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                    <Field label={t('special_woreda', 'Special Woreda')} error={errors.special_woreda?.message || serverErrors?.special_woreda?.[0]}>
                      <select
                        {...register('special_woreda', {
                          required: t('req_special_woreda', 'Special Woreda is required'),
                          onChange: () => resetField('kebele'),
                        })}
                        className={inputClass}
                      >
                        <option value="">{t('select_special_woreda', 'Select Special Woreda')}</option>
                        {specialWoredas.map((sw) => (
                          <option key={sw.id} value={sw.id}>{sw.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {((adminType === ADMIN_TYPE_ZONE && selectedWoreda) ||
                    (adminType === ADMIN_TYPE_SPECIAL_WOREDA && selectedSpecialWoreda)) && (
                    <Field label={t('kebele', 'Kebele')} error={errors.kebele?.message || serverErrors?.kebele?.[0]}>
                      <select
                        {...register('kebele', { required: t('req_kebele', 'Kebele is required') })}
                        className={inputClass}
                      >
                        <option value="">{t('select_kebele', 'Select Kebele')}</option>
                        {kebeles.map((k) => (
                          <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON & FOOTER */}
            <div className="pt-6 space-y-3 shrink-0">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingText={t('creating_account', 'Creating Account...')}
                className="py-3 shadow-primary-500/30"
              >
                {t('register_account', 'Register Account')}
              </Button>

              <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">
                {t('already_registered', 'Already registered?')} {' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors">
                  {t('login_here', 'Log in here')}
                </Link>
              </p>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

const inputClass =
  'w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none';

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-300 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight">{error}</p>}
    </div>
  );
}

export default RegistrationPage;