import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { authService } from '../api/authService';
import { useLocationTree } from '../hooks/useLocationTree';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

function RegistrationPage() {
  const navigate = useNavigate();
  const { regions, isLoading: locationsLoading, error: locationsError, getZonesForRegion, getSpecialWoredasForRegion, getWoredasForZone } = useLocationTree();

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
      language_preference: 'EN',
    },
  });

  const selectedRegion = watch('region');
  const selectedZone = watch('zone');

  const zones = selectedRegion ? getZonesForRegion(selectedRegion) : [];
  const specialWoredas = selectedRegion ? getSpecialWoredasForRegion(selectedRegion) : [];
  const woredas = selectedRegion && selectedZone ? getWoredasForZone(selectedRegion, selectedZone) : [];

  const handleRegionChange = (e) => {
    resetField('zone');
    resetField('woreda');
    resetField('special_woreda');
  };

  const handleAdminTypeChange = (type) => {
    setAdminType(type);
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
        setServerErrors({ non_field_errors: [err.response?.data?.detail || 'Registration failed. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-primary-700 mb-3">Registration Successful</h2>
          <p className="text-gray-600 text-sm mb-6">{successMessage}</p>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-primary-700 mb-1">Create an Account</h1>
        <p className="text-sm text-gray-500 mb-6">Register as a Farmer to get started.</p>

        {serverErrors?.non_field_errors && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {serverErrors.non_field_errors.join(' ')}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" error={errors.first_name?.message || serverErrors?.first_name?.[0]}>
              <input {...register('first_name', { required: 'First name is required' })} className={inputClass} />
            </Field>
            <Field label="Last Name" error={errors.last_name?.message || serverErrors?.last_name?.[0]}>
              <input {...register('last_name', { required: 'Last name is required' })} className={inputClass} />
            </Field>
          </div>

          <Field label="Middle Name (optional)" error={serverErrors?.middle_name?.[0]}>
            <input {...register('middle_name')} className={inputClass} />
          </Field>

          <Field label="Email" error={errors.email?.message || serverErrors?.email?.[0]}>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className={inputClass}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone_number?.message || serverErrors?.phone_number?.[0]}>
            <input
              {...register('phone_number', { required: 'Phone number is required' })}
              placeholder="+251912345678"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Password" error={errors.password?.message || serverErrors?.password?.[0]}>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={inputClass}
              />
            </Field>
            <Field label="Confirm Password" error={errors.confirm_password?.message || serverErrors?.confirm_password?.[0]}>
              <input
                type="password"
                {...register('confirm_password', { required: 'Please confirm your password' })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Language Preference">
            <select {...register('language_preference')} className={inputClass}>
              <option value="EN">English</option>
              <option value="AM">Amharic</option>
            </select>
          </Field>

          <hr className="my-4" />
          <p className="text-sm font-medium text-gray-700">Location</p>

          {locationsLoading && <p className="text-sm text-gray-400">Loading location data...</p>}
          {locationsError && <p className="text-sm text-red-600">{locationsError}</p>}

          {!locationsLoading && !locationsError && (
            <>
              <Field label="Region" error={errors.region?.message || serverErrors?.region?.[0]}>
                <select
                  {...register('region', { required: 'Region is required', onChange: handleRegionChange })}
                  className={inputClass}
                >
                  <option value="">Select a Region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>

              {selectedRegion && (
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={adminType === ADMIN_TYPE_ZONE}
                      onChange={() => handleAdminTypeChange(ADMIN_TYPE_ZONE)}
                    />
                    Zone / Woreda
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={adminType === ADMIN_TYPE_SPECIAL_WOREDA}
                      onChange={() => handleAdminTypeChange(ADMIN_TYPE_SPECIAL_WOREDA)}
                    />
                    Special Woreda
                  </label>
                </div>
              )}

              {selectedRegion && adminType === ADMIN_TYPE_ZONE && (
                <>
                  <Field label="Zone" error={errors.zone?.message || serverErrors?.zone?.[0]}>
                    <select {...register('zone', { required: 'Zone is required' })} className={inputClass}>
                      <option value="">Select a Zone</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </Field>

                  {selectedZone && (
                    <Field label="Woreda" error={errors.woreda?.message || serverErrors?.woreda?.[0]}>
                      <select {...register('woreda', { required: 'Woreda is required' })} className={inputClass}>
                        <option value="">Select a Woreda</option>
                        {woredas.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                </>
              )}

              {selectedRegion && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                <Field label="Special Woreda" error={errors.special_woreda?.message || serverErrors?.special_woreda?.[0]}>
                  <select {...register('special_woreda', { required: 'Special Woreda is required' })} className={inputClass}>
                    <option value="">Select a Special Woreda</option>
                    {specialWoredas.map((sw) => (
                      <option key={sw.id} value={sw.id}>{sw.name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default RegistrationPage;