import React, { useState, useEffect } from 'react';
import { Upload, message, Button } from 'antd';
import { InboxOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Dragger } = Upload;

/**
 * Reusable Image Upload Component
 * Supports Drag & Drop, File Validation (size, type), Preview, Replace, and Remove.
 * Stores files for standard multipart/form-data upload (NO Base64).
 */
const ImageUpload = ({ value, onChange, maxMb = 5, label = "Click or drag image to this area to upload" }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    // If a string (URL from backend) is passed initially, show it as preview
    useEffect(() => {
        if (value && typeof value === 'string') {
            setPreviewUrl(value);
        } else if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (!value) {
            setPreviewUrl(null);
        }
    }, [value]);

    const beforeUpload = (file) => {
        const isJpgOrPngOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPngOrWebp) {
            message.error('You can only upload JPG, JPEG, PNG, or WEBP files!');
            return Upload.LIST_IGNORE;
        }
        
        const isLtMaxMb = file.size / 1024 / 1024 < maxMb;
        if (!isLtMaxMb) {
            message.error(`Image must be smaller than ${maxMb}MB!`);
            return Upload.LIST_IGNORE;
        }

        // Pass the raw File object to the parent via onChange
        onChange(file);
        
        // Prevent default antd upload behavior
        return false;
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange(null);
        setPreviewUrl(null);
    };

    return (
        <div className="w-full relative group">
            {previewUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-50 flex items-center justify-center group">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Upload
                            name="image"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            accept="image/jpeg,image/png,image/webp"
                        >
                            <Button type="primary" size="middle" className="bg-emerald-600 hover:bg-emerald-500">
                                Replace
                            </Button>
                        </Upload>
                        <Button 
                            danger 
                            type="primary" 
                            icon={<DeleteOutlined />} 
                            onClick={handleRemove}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <Dragger
                    name="image"
                    multiple={false}
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="bg-emerald-50/30 border-emerald-200 hover:border-emerald-500 transition-colors"
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined className="text-emerald-500" />
                    </p>
                    <p className="ant-upload-text font-medium text-slate-700">
                        {label}
                    </p>
                    <p className="ant-upload-hint text-slate-500">
                        Supports JPG, PNG, and WEBP. Strict limit: {maxMb}MB.
                    </p>
                </Dragger>
            )}
        </div>
    );
};

ImageUpload.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File)]),
    onChange: PropTypes.func.isRequired,
    maxMb: PropTypes.number,
    label: PropTypes.string,
};

export default ImageUpload;
