import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import Card from '../ui/Card';
import { changePassword } from '../../api/profileService';

export default function SecurityCard() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await changePassword(values);
            message.success(t('password_changed_successfully', 'Password changed successfully.'));
            form.resetFields();
        } catch (error) {
            let errorMsg = t('password_change_failed', 'Failed to change password.');
            if (error.response?.data) {
                const errors = error.response.data;
                if (typeof errors === 'object') {
                    const firstKey = Object.keys(errors)[0];
                    if (Array.isArray(errors[firstKey])) {
                        errorMsg = errors[firstKey][0];
                    } else if (typeof errors[firstKey] === 'string') {
                        errorMsg = errors[firstKey];
                    }
                }
            }
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={t('security', 'Security')} className="h-full">
            <div className="flex flex-col h-full">
                <div className="mb-6 text-slate-500 dark:text-slate-400 text-sm">
                    {t('change_password_hint', 'Ensure your account is using a long, random password to stay secure.')}
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    className="mt-auto"
                >
                    <Form.Item
                        name="current_password"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('current_password', 'Current Password')}</span>}
                        rules={[{ required: true, message: t('current_password_required', 'Please input your current password.') }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="text-slate-400" />} 
                            size="large"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="new_password"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('new_password', 'New Password')}</span>}
                        rules={[{ required: true, message: t('new_password_required', 'Please input your new password.') }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="text-slate-400" />} 
                            size="large"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirm_password"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">{t('confirm_password', 'Confirm Password')}</span>}
                        dependencies={['new_password']}
                        rules={[
                            { required: true, message: t('confirm_password_required', 'Please confirm your new password.') },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('passwords_do_not_match', 'The two passwords that you entered do not match!')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="text-slate-400" />} 
                            size="large"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 rounded-lg w-full mt-2"
                        size="large"
                    >
                        {t('change_password', 'Change Password')}
                    </Button>
                </Form>
            </div>
        </Card>
    );
}
