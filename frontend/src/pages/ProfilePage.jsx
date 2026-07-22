import { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { useLocationTree } from '../hooks/useLocationTree';

const ADMIN_TYPE_ZONE = 'ZONE';
const ADMIN_TYPE_SPECIAL_WOREDA = 'SPECIAL_WOREDA';

function ProfilePage() {
  const { refreshUser } = useAuth();
  const { regions, isLoading: locationsLoading, getZonesForRegion, getSpecialWoredasForRegion, getWoredasForZone } = useLocationTree();

  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState(null);
  const [adminType, setAdminType] = useState(ADMIN_TYPE_ZONE);
  const [errors, setErrors] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Change password section state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' });
  const [pwErrors, setPwErrors] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    authService
      .getProfile()
      .then((response) => {
        const data = response.data;
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          middle_name: data.middle_name || '',
          last_name: data.last_name,
          phone_number: data.phone_number,
          language_preference: data.language_preference,
          region: data.region,
          zone: data.zone || '',
          woreda: data.woreda || '',
          special_woreda: data.special_woreda || '',
        });
        setAdminType(data.special_woreda ? ADMIN_TYPE_SPECIAL_WOREDA : ADMIN_TYPE_ZONE);
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  if (isLoadingProfile || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const zones = formData.region ? getZonesForRegion(formData.region) : [];
  const specialWoredas = formData.region ? getSpecialWoredasForRegion(formData.region) : [];
  const woredas = formData.region && formData.zone ? getWoredasForZone(formData.region, formData.zone) : [];

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegionChange = (value) => {
    setFormData((prev) => ({ ...prev, region: value, zone: '', woreda: '', special_woreda: '' }));
  };

  const handleAdminTypeChange = (type) => {
    setAdminType(type);
    if (type === ADMIN_TYPE_ZONE) {
      setFormData((prev) => ({ ...prev, special_woreda: '' }));
    } else {
      setFormData((prev) => ({ ...prev, zone: '', woreda: '' }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrors(null);
    setSaveMessage('');
    setIsSaving(true);

    const payload = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      language_preference: formData.language_preference,
      region: formData.region,
      zone: adminType === ADMIN_TYPE_ZONE ? formData.zone || null : null,
      woreda: adminType === ADMIN_TYPE_ZONE ? formData.woreda || null : null,
      special_woreda: adminType === ADMIN_TYPE_SPECIAL_WOREDA ? formData.special_woreda || null : null,
    };

    try {
      const response = await authService.updateProfile(payload);
      setProfile(response.data);
      setSaveMessage('Profile updated successfully.');
      refreshUser(); // Keep AuthContext's user data in sync (e.g. nav bar name)
    } catch (err) {
      setErrors(err.response?.data?.errors || { non_field_errors: [err.response?.data?.detail || 'Update failed.'] });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwErrors(null);
    setPwMessage('');
    setPwSaving(true);

    try {
      await authService.changePassword(pwForm);
      setPwMessage('Password changed successfully.');
      setPwForm({ current_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPwErrors(err.response?.data?.errors || { non_field_errors: [err.response?.data?.detail || 'Change failed.'] });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ---------- Profile Info ---------- */}
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-semibold text-primary-700 mb-1">My Profile</h1>
          <p className="text-sm text-gray-500 mb-6">{profile.email} · {profile.role}</p>

          {saveMessage && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 text-sm rounded">{saveMessage}</div>
          )}
          {errors?.non_field_errors && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{errors.non_field_errors.join(' ')}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField label="First Name" value={formData.first_name} onChange={(v) => handleFieldChange('first_name', v)} error={errors?.first_name?.[0]} />
              <TextField label="Last Name" value={formData.last_name} onChange={(v) => handleFieldChange('last_name', v)} error={errors?.last_name?.[0]} />
            </div>
            <TextField label="Middle Name" value={formData.middle_name} onChange={(v) => handleFieldChange('middle_name', v)} error={errors?.middle_name?.[0]} />
            <TextField label="Phone Number" value={formData.phone_number} onChange={(v) => handleFieldChange('phone_number', v)} error={errors?.phone_number?.[0]} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language Preference</label>
              <select
                value={formData.language_preference}
                onChange={(e) => handleFieldChange('language_preference', e.target.value)}
                className={inputClass}
              >
                <option value="EN">English</option>
                <option value="AM">Amharic</option>
              </select>
            </div>

            <hr />
            <p className="text-sm font-medium text-gray-700">Location</p>

            {locationsLoading ? (
              <p className="text-sm text-gray-400">Loading location data...</p>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a Region</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors?.region && <p className="text-xs text-red-600 mt-1">{errors.region[0]}</p>}
                </div>

                {formData.region && (
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={adminType === ADMIN_TYPE_ZONE} onChange={() => handleAdminTypeChange(ADMIN_TYPE_ZONE)} />
                      Zone / Woreda
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={adminType === ADMIN_TYPE_SPECIAL_WOREDA} onChange={() => handleAdminTypeChange(ADMIN_TYPE_SPECIAL_WOREDA)} />
                      Special Woreda
                    </label>
                  </div>
                )}

                {formData.region && adminType === ADMIN_TYPE_ZONE && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                      <select
                        value={formData.zone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, zone: e.target.value, woreda: '' }))}
                        className={inputClass}
                      >
                        <option value="">Select a Zone</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      </select>
                      {errors?.zone && <p className="text-xs text-red-600 mt-1">{errors.zone[0]}</p>}
                    </div>

                    {formData.zone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Woreda</label>
                        <select
                          value={formData.woreda}
                          onChange={(e) => handleFieldChange('woreda', e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select a Woreda</option>
                          {woredas.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                        {errors?.woreda && <p className="text-xs text-red-600 mt-1">{errors.woreda[0]}</p>}
                      </div>
                    )}
                  </>
                )}

                {formData.region && adminType === ADMIN_TYPE_SPECIAL_WOREDA && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Woreda</label>
                    <select
                      value={formData.special_woreda}
                      onChange={(e) => handleFieldChange('special_woreda', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select a Special Woreda</option>
                      {specialWoredas.map((sw) => (
                        <option key={sw.id} value={sw.id}>{sw.name}</option>
                      ))}
                    </select>
                    {errors?.special_woreda && <p className="text-xs text-red-600 mt-1">{errors.special_woreda[0]}</p>}
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ---------- Change Password ---------- */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>

          {pwMessage && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 text-sm rounded">{pwMessage}</div>
          )}
          {pwErrors?.non_field_errors && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{pwErrors.non_field_errors.join(' ')}</div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <TextField
              label="Current Password" type="password"
              value={pwForm.current_password}
              onChange={(v) => setPwForm((p) => ({ ...p, current_password: v }))}
              error={pwErrors?.current_password?.[0]}
            />
            <TextField
              label="New Password" type="password"
              value={pwForm.new_password}
              onChange={(v) => setPwForm((p) => ({ ...p, new_password: v }))}
              error={pwErrors?.new_password?.[0]}
            />
            <TextField
              label="Confirm New Password" type="password"
              value={pwForm.confirm_new_password}
              onChange={(v) => setPwForm((p) => ({ ...p, confirm_new_password: v }))}
              error={pwErrors?.confirm_new_password?.[0]}
            />
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
            >
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function TextField({ label, value, onChange, error, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default ProfilePage;