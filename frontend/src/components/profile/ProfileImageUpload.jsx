import React from 'react';
import ImageUpload from '../ui/ImageUpload';
import { useTranslation } from 'react-i18next';

export default function ProfileImageUpload({ value, onChange }) {
    const { t } = useTranslation();

    return (
        <div className="w-full">
            <ImageUpload 
                value={value} 
                onChange={onChange}
                label={t('upload_image', 'Click or drag image to this area to upload')}
                maxMb={5}
            />
        </div>
    );
}
