import React, { useState } from 'react';
import { Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

export const ImageMessage = ({ imageUrl, fileName }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-700 max-w-xs"
        onClick={() => setModalOpen(true)}
      >
        <img 
          src={imageUrl} 
          alt={fileName || 'Chat Attachment'} 
          className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl">
          <EyeOutlined />
        </div>
      </div>

      <Modal
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
        centered
        width={700}
        styles={{ body: { padding: 0 } }}
      >
        <img src={imageUrl} alt={fileName || 'Preview'} className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
      </Modal>
    </>
  );
};
