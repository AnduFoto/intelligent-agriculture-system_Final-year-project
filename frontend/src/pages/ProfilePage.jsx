import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Modal, Form, Input, Select, Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../api/profileService';
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInformationCard from '../components/profile/PersonalInformationCard';
import LocationInformationCard from '../components/profile/LocationInformationCard';
import RoleInformationCard from '../components/profile/RoleInformationCard';
import ProfessionalInformationCard from '../components/profile/ProfessionalInformationCard';
import AssignmentInformationCard from '../components/profile/AssignmentInformationCard';
import ManagementInformationCard from '../components/profile/ManagementInformationCard';
import SecurityCard from '../components/profile/SecurityCard';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import ProfileImageUpload from '../components/profile/ProfileImageUpload';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [form] = Form.useForm();
    const [selectedImage, setSelectedImage] = useState(null);

    const loadProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch (error) {
            message.error(t('failed_to_load_profile', 'Failed to load profile information.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const showEditModal = () => {
        form.setFieldsValue({
            first_name: profile.first_name,
            middle_name: profile.middle_name,
            last_name: profile.last_name,
            phone_number: profile.phone_number,
            language_preference: profile.language_preference,
        });
        setSelectedImage(profile.profile_image);
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        form.resetFields();
        setSelectedImage(null);
    };

    const handleEditSubmit = async (values) => {
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('first_name', values.first_name);
            formData.append('middle_name', values.middle_name || '');
            formData.append('last_name', values.last_name);
            formData.append('phone_number', values.phone_number);
            formData.append('language_preference', values.language_preference);
            
            if (selectedImage instanceof File) {
                formData.append('profile_image', selectedImage);
            } else if (selectedImage === null && profile.profile_image) {
                // If the user removed the existing image
                formData.append('profile_image', '');
            }

            const updatedProfile = await updateMyProfile(formData);
            setProfile(updatedProfile);
            await refreshUser();
            message.success(t('profile_updated_successfully', 'Profile updated successfully.'));
            setIsEditModalVisible(false);
        } catch (error) {
            message.error(t('failed_to_update_profile', 'Failed to update profile.'));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProfileSkeleton />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500">
                {t('profile_not_found', 'Profile not found.')}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
            <ProfileHeader profile={profile} onEditClick={showEditModal} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <PersonalInformationCard profile={profile} />
                    <RoleInformationCard profile={profile} />
                    {profile.role === 'OFFICER' && (
                        <AssignmentInformationCard profile={profile} />
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {profile.role !== 'OFFICER' && (
                        <LocationInformationCard profile={profile} />
                    )}
                    {profile.role === 'OFFICER' && (
                        <ProfessionalInformationCard profile={profile} />
                    )}
                    {(profile.management_information && Object.keys(profile.management_information).length > 0) && (
                        <ManagementInformationCard profile={profile} />
                    )}
                    <SecurityCard />
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                title={<span className="text-lg font-bold text-slate-800 dark:text-white">{t('edit_profile', 'Edit Profile')}</span>}
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    requiredMark={false}
                    className="mt-4"
                >
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('profile_image', 'Profile Image')}
                        </label>
                        <ProfileImageUpload value={selectedImage} onChange={setSelectedImage} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item
                            name="first_name"
                            label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('first_name', 'First Name')}</span>}
                            rules={[{ required: true, message: t('first_name_required', 'First Name is required.') }]}
                        >
                            <Input size="large" className="rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            name="middle_name"
                            label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('middle_name', 'Middle Name')}</span>}
                        >
                            <Input size="large" className="rounded-lg" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="last_name"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('last_name', 'Last Name')}</span>}
                        rules={[{ required: true, message: t('last_name_required', 'Last Name is required.') }]}
                    >
                        <Input size="large" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        name="phone_number"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('phone_number', 'Phone Number')}</span>}
                        rules={[{ required: true, message: t('phone_number_required', 'Phone Number is required.') }]}
                    >
                        <Input size="large" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        name="language_preference"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('language_preference', 'Language Preference')}</span>}
                        rules={[{ required: true, message: t('language_preference_required', 'Language Preference is required.') }]}
                    >
                        <Select size="large" className="rounded-lg">
                            <Select.Option value="EN">English</Select.Option>
                            <Select.Option value="AM">አማርኛ</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button onClick={handleEditCancel} size="large" className="rounded-lg">
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={updating}
                            size="large"
                            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg border-none"
                        >
                            {t('save_changes', 'Save Changes')}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}