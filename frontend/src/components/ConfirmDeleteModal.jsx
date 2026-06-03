import React from 'react';

const ConfirmDeleteModal = ({ open, title, message, onConfirm, onClose, loading }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
