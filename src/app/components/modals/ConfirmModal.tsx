'use client';

import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actionLabel={confirmLabel}
      disabled={false}
      onSubmit={onConfirm}
      secondaryActionLabel={cancelLabel}
      secondaryAction={onClose}
      body={
        <div className="text-sm text-neutral-700">
          {message}
        </div>
      }
    />
  );
};

export default ConfirmModal;