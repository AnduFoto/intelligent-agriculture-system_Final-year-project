// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Link, useNavigate } from 'react-router-dom';

// import { authService } from '../api/authService';
// import { useLocationTree } from '../hooks/useLocationTree';

// const ADMIN_TYPE_ZONE = 'ZONE';
// const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

// function RegistrationPage() {
//   const navigate = useNavigate();
//   const {
//     regions,
//     isLoading: locationsLoading,
//     error: locationsError,
//     getZonesForRegion,
//     getSpecialWoredasForRegion,
//     getWoredasForZone,
//     getKebelesForWoreda,
//     getKebelesForSpecialWoreda,
//   } = useLocationTree();

//   const [adminType, setAdminType] = useState(ADMIN_TYPE_ZONE);
//   const [serverErrors, setServerErrors] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     resetField,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       first_name: '',
//       middle_name: '',
//       last_name: '',
//       email: '',
//       phone_number: '',
//       password: '',
//       confirm_password: '',
//       region: '',
//       zone: '',
//       woreda: '',
//       special_woreda: '',
//       kebele: '',
//       language_preference: 'EN',
//     },
//   });

//   const selectedRegion = watch('region');
//   const selectedZone = watch('zone');
//   const selectedWoreda = watch('woreda');
//   const selectedSpecialWoreda = watch('special_woreda');

//   const zones = selectedRegion ? getZonesForRegion(selectedRegion) : [];
//   const specialWoredas = selectedRegion ? getSpecialWoredasForRegion(selectedRegion) : [];
//   const woredas = selectedRegion && selectedZone ? getWoredasForZone(selectedRegion, selectedZone) : [];

//   const kebeles =
//     adminType === ADMIN_TYPE_ZONE
//       ? (selectedRegion && selectedZone && selectedWoreda
//           ? getKebelesForWoreda(selectedRegion, selectedZone, selectedWoreda)
//           : [])
//       : (selectedRegion && selectedSpecialWoreda
//           ? getKebelesForSpecialWoreda(selectedRegion, selectedSpecialWoreda)
//           : []);

//   const handleRegionChange = () => {
//     resetField('zone');
//     resetField('woreda');
//     resetField('special_woreda');
//     resetField('kebele');
//   };

//   const handleAdminTypeChange = (type) => {
//     setAdminType(type);
//     resetField('kebele');
//     if (type === ADMIN_TYPE_ZONE) {
//       resetField('special_woreda');
//     } else {
//       resetField('zone');
//       resetField('woreda');
//     }
//   };

//   const onSubmit = async (data) => {
//     setServerErrors(null);
//     setIsSubmitting(true);

//     const payload = {
//       ...data,
//       zone: adminType === ADMIN_TYPE_ZONE ? data.zone : null,
//       woreda: adminType === ADMIN_TYPE_ZONE ? data.woreda : null,
//       special_woreda: adminType === ADMIN_TYPE_SPECIAL_WOREDA ? data.special_woreda : null,
//     };

//     try {
//       const response = await authService.register(payload);
//       setSuccessMessage(response.data.message);
//     } catch (err) {
//       if (err.response?.data?.errors) {
//         setServerErrors(err.response.data.errors);
//       } else {
//         setServerErrors({ non_field_errors: [err.response?.data?.detail || 'Registration failed. Please try again.'] });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (successMessage) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//         <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
//           <h2 className="text-xl font-semibold text-primary-700 mb-3">Registration Successful</h2>
//           <p className="text-gray-600 text-sm mb-6">{successMessage}</p>
//           <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             Go to Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
//       <div className="max-w-lg w-full bg-white rounded-lg shadow p-8">
//         <h1 className="text-2xl font-semibold text-primary-700 mb-1">Create an Account</h1>
//         <p className="text-sm text-gray-500 mb-6">Register as a Farmer to get started.</p>

//         {serverErrors?.non_field_errors && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
//             {serverErrors.non_field_errors.join(' ')}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field label="First Name" error={errors.first_name?.message || serverErrors?.first_name?.[0]}>
//               <input {...register('first_name', { required: 'First name is required' })} className={inputClass} />
//             </Field>
//             <Field label="Last Name" error={errors.last_name?.message || serverErrors?.last_name?.[0]}>
//               <input {...register('last_name', { required: 'Last name is required' })} className={inputClass} />
//             </Field>
//           </div>

//           <Field label="Middle Name (optional)" error={serverErrors?.middle_name?.[0]}>
//             <input {...register('middle_name')} className={inputClass} />
//           </Field>

//           <Field label="Email" error={errors.email?.message || serverErrors?.email?.[0]}>
//             <input
//               type="email"
//               {...register('email', { required: 'Email is required' })}
//               className={inputClass}
//             />
//           </Field>

//           <Field label="Phone Number" error={errors.phone_number?.message || serverErrors?.phone_number?.[0]}>
//             <input
//               {...register('phone_number', { required: 'Phone number is required' })}
//               placeholder="+251912345678"
//               className={inputClass}
//             />
//           </Field>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field label="Password" error={errors.password?.message || serverErrors?.password?.[0]}>
//               <input
//                 type="password"
//                 {...register('password', { required: 'Password is required' })}
//                 className={inputClass}
//               />
//             </Field>
//             <Field label="Confirm Password" error={errors.confirm_password?.message || serverErrors?.confirm_password?.[0]}>
//               <input
//                 type="password"
//                 {...register('confirm_password', { required: 'Please confirm your password' })}
//                 className={inputClass}
//               />
//             </Field>
//           </div>

//           <Field label="Language Preference">
//             <select {...register('language_preference')} className={inputClass}>
//               <option value="EN">English</option>
//               <option value="AM">Amharic</option>
//             </select>
//           </Field>

//           <hr className="my-4" />
//           <p className="text-sm font-medium text-gray-700">Location</p>

//           {locationsLoading && <p className="text-sm text-gray-400">Loading location data...</p>}
//           {locationsError && <p className="text-sm text-red-600">{locationsError}</p>}

//           {!locationsLoading && !locationsError && (
//             <>
//               <Field label="Region" error={errors.region?.message || serverErrors?.region?.[0]}>
//                 <select
//                   {...register('region', { required: 'Region is required', onChange: handleRegionChange })}
//                   className={inputClass}
//                 >
//                   <option value="">Select a Region</option>
//                   {regions.map((r) => (
//                     <option key={r.id} value={r.id}>{r.name}</option>
//                   ))}
//                 </select>
//               </Field>

//               {selectedRegion && (
//                 <div className="flex gap-4 text-sm">
//                   <label className="flex items-center gap-1">
//                     <input
//                       type="radio"
//                       checked={adminType === ADMIN_TYPE_ZONE}
//                       onChange={() => handleAdminTypeChange(ADMIN_TYPE_ZONE)}
//                     />
//                     Zone / Woreda
//                   </label>
//                   <label className="flex items-center gap-1">
//                     <input
//                       type="radio"
//                       checked={adminType === ADMIN_TYPE_SPECIAL_WOREDA}
//                       onChange={() => handleAdminTypeChange(ADMIN_TYPE_SPECIAL_WOREDA)}
//                     />
//                     Special Woreda
//                   </label>
//                 </div>
//               )}

//               {selectedRegion && adminType === ADMIN_TYPE_ZONE && (
//                 <>
//                   <Field label="Zone" error={errors.zone?.message || serverErrors?.zone?.[0]}>
//                     <select
//                       {...register('zone', {
//                         required: 'Zone is required',
//                         onChange: () => { resetField('woreda'); resetField('kebele'); },
//                       })}
//                       className={inputClass}
//                     >
//                       <option value="">Select a Zone</option>
//                       {zones.map((z) => (
//                         <option key={z.id} value={z.id}>{z.name}</option>
//                       ))}
//                     </select>
//                   </Field>

//                   {selectedZone && (
//                     <Field label="Woreda" error={errors.woreda?.message || serverErrors?.woreda?.[0]}>
//                       <select
//                         {...register('woreda', {
//                           required: 'Woreda is required',
//                           onChange: () => resetField('kebele'),
//                         })}
//                         className={inputClass}
//                       >
//                         <option value="">Select a Woreda</option>
//                         {woredas.map((w) => (
//                           <option key={w.id} value={w.id}>{w.name}</option>
//                         ))}
//                       </select>
//                     </Field>
//                   )}
//                 </>
//               )}

//               {selectedRegion && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
//                 <Field label="Special Woreda" error={errors.special_woreda?.message || serverErrors?.special_woreda?.[0]}>
//                   <select
//                     {...register('special_woreda', {
//                       required: 'Special Woreda is required',
//                       onChange: () => resetField('kebele'),
//                     })}
//                     className={inputClass}
//                   >
//                     <option value="">Select a Special Woreda</option>
//                     {specialWoredas.map((sw) => (
//                       <option key={sw.id} value={sw.id}>{sw.name}</option>
//                     ))}
//                   </select>
//                 </Field>
//               )}

//               {((adminType === ADMIN_TYPE_ZONE && selectedWoreda) ||
//                 (adminType === ADMIN_TYPE_SPECIAL_WOREDA && selectedSpecialWoreda)) && (
//                 <Field label="Kebele" error={errors.kebele?.message || serverErrors?.kebele?.[0]}>
//                   <select
//                     {...register('kebele', { required: 'Kebele is required' })}
//                     className={inputClass}
//                   >
//                     <option value="">Select a Kebele</option>
//                     {kebeles.map((k) => (
//                       <option key={k.id} value={k.id}>{k.name}</option>
//                     ))}
//                   </select>
//                 </Field>
//               )}
//             </>
//           )}

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
//           >
//             {isSubmitting ? 'Creating Account...' : 'Register'}
//           </button>
//         </form>

//         <p className="text-sm text-gray-500 text-center mt-6">
//           Already have an account?{' '}
//           <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
//             Log in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// const inputClass =
//   'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

// function Field({ label, error, children }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       {children}
//       {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
//     </div>
//   );
// }

// export default RegistrationPage;



import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { authService } from '../api/authService';
import { useLocationTree } from '../hooks/useLocationTree';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

function RegistrationPage() {
  const navigate = useNavigate();
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
        setServerErrors({ non_field_errors: [err.response?.data?.detail || 'Registration failed. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Registration Successful</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{successMessage}</p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-950/50 transition-all text-xs sm:text-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* EXPANDED CONTAINER WITH WIDER MAX-WIDTH AND TALLER HEIGHT */}
      <div className="max-w-7xl w-full h-[88vh] bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 lg:p-10 shadow-2xl backdrop-blur-xl relative z-10 flex flex-col justify-between overflow-hidden">
        
        {/* HEADER */}
        <div className="mb-3 text-left shrink-0">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 inline-block mb-1.5">
            Farmer Portal Onboarding
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Create an Account
          </h1>
        </div>

        {/* SERVER LEVEL NON-FIELD ERRORS */}
        {serverErrors?.non_field_errors && (
          <div className="mb-3 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2.5 shrink-0">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{serverErrors.non_field_errors.join(' ')}</span>
          </div>
        )}

        {/* FORM GRID - EXPANDED 2-COLUMN LAYOUT */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start h-full min-h-0">
          
          {/* SIDE 1: PERSONAL DETAILS (UP TO LANGUAGE PREFERENCE) */}
          <div className="space-y-3 lg:space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 border-b border-zinc-800/80 pb-2">
              1. Personal Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={errors.first_name?.message || serverErrors?.first_name?.[0]}>
                <input {...register('first_name', { required: 'First name is required' })} className={inputClass} placeholder="John" />
              </Field>

              <Field label="Last Name" error={errors.last_name?.message || serverErrors?.last_name?.[0]}>
                <input {...register('last_name', { required: 'Last name is required' })} className={inputClass} placeholder="Doe" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Middle Name (optional)" error={serverErrors?.middle_name?.[0]}>
                <input {...register('middle_name')} className={inputClass} placeholder="Abebe" />
              </Field>

              <Field label="Phone Number" error={errors.phone_number?.message || serverErrors?.phone_number?.[0]}>
                <input
                  {...register('phone_number', { required: 'Phone number is required' })}
                  placeholder="+251912345678"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Email Address" error={errors.email?.message || serverErrors?.email?.[0]}>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={inputClass}
                placeholder="farmer@example.com"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Password" error={errors.password?.message || serverErrors?.password?.[0]}>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>

              <Field label="Confirm Password" error={errors.confirm_password?.message || serverErrors?.confirm_password?.[0]}>
                <input
                  type="password"
                  {...register('confirm_password', { required: 'Please confirm your password' })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
            </div>

            <Field label="Language Preference">
              <select {...register('language_preference')} className={inputClass}>
                <option value="EN">English</option>
                <option value="AM">Amharic (አማርኛ)</option>
              </select>
            </Field>
          </div>

          {/* SIDE 2: LOCATION & SUBMIT BUTTON */}
          <div className="space-y-3 lg:space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 border-b border-zinc-800/80 pb-2">
                2. Geographic Location
              </h2>

              {locationsLoading && (
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span>Loading locations...</span>
                </div>
              )}

              {locationsError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs">
                  {locationsError}
                </div>
              )}

              {!locationsLoading && !locationsError && (
                <div className="space-y-3.5">
                  <Field label="Region" error={errors.region?.message || serverErrors?.region?.[0]}>
                    <select
                      {...register('region', { required: 'Region is required', onChange: handleRegionChange })}
                      className={inputClass}
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </Field>

                  {selectedRegion && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                        Administrative Unit Type
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleAdminTypeChange(ADMIN_TYPE_ZONE)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            adminType === ADMIN_TYPE_ZONE
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Zone / Woreda
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminTypeChange(ADMIN_TYPE_SPECIAL_WOREDA)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            adminType === ADMIN_TYPE_SPECIAL_WOREDA
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Special Woreda
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRegion && adminType === ADMIN_TYPE_ZONE && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Zone" error={errors.zone?.message || serverErrors?.zone?.[0]}>
                        <select
                          {...register('zone', {
                            required: 'Zone is required',
                            onChange: () => { resetField('woreda'); resetField('kebele'); },
                          })}
                          className={inputClass}
                        >
                          <option value="">Select Zone</option>
                          {zones.map((z) => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                          ))}
                        </select>
                      </Field>

                      {selectedZone ? (
                        <Field label="Woreda" error={errors.woreda?.message || serverErrors?.woreda?.[0]}>
                          <select
                            {...register('woreda', {
                              required: 'Woreda is required',
                              onChange: () => resetField('kebele'),
                            })}
                            className={inputClass}
                          >
                            <option value="">Select Woreda</option>
                            {woredas.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </Field>
                      ) : (
                        <div className="flex flex-col justify-end">
                          <div className="h-[38px] border border-zinc-800/40 bg-zinc-950/30 rounded-xl flex items-center px-3 text-xs text-zinc-600 italic">
                            Select Zone first
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRegion && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                    <Field label="Special Woreda" error={errors.special_woreda?.message || serverErrors?.special_woreda?.[0]}>
                      <select
                        {...register('special_woreda', {
                          required: 'Special Woreda is required',
                          onChange: () => resetField('kebele'),
                        })}
                        className={inputClass}
                      >
                        <option value="">Select Special Woreda</option>
                        {specialWoredas.map((sw) => (
                          <option key={sw.id} value={sw.id}>{sw.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {((adminType === ADMIN_TYPE_ZONE && selectedWoreda) ||
                    (adminType === ADMIN_TYPE_SPECIAL_WOREDA && selectedSpecialWoreda)) && (
                    <Field label="Kebele" error={errors.kebele?.message || serverErrors?.kebele?.[0]}>
                      <select
                        {...register('kebele', { required: 'Kebele is required' })}
                        className={inputClass}
                      >
                        <option value="">Select Kebele</option>
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
            <div className="pt-2 space-y-2 shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-950/50 transition-all text-xs sm:text-sm active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
              </button>

              <p className="text-xs text-zinc-400 text-center">
                Already registered?{' '}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Log in here
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
  'w-full bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all outline-none';

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400 font-medium leading-tight">{error}</p>}
    </div>
  );
}

export default RegistrationPage;