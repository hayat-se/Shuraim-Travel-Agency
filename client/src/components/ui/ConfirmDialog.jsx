import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Textarea } from './Input';

/**
 * Drop-in replacement for window.confirm / window.prompt.
 *   <ConfirmDialog open title message confirmLabel variant
 *                  withReason reasonLabel  // optional text input (e.g. rejection reason)
 *                  onConfirm={(reason) => ...} onCancel />
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  withReason = false,
  reasonLabel = 'Reason',
  reasonRequired = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const disabled = loading || (withReason && reasonRequired && !reason.trim());

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} loading={loading} disabled={disabled} onClick={() => onConfirm?.(reason)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-neutral-600">{message}</p>}
      {withReason && (
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-neutral-700">{reasonLabel}</label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Type here..." rows={3} />
        </div>
      )}
    </Modal>
  );
}
