import React from "react";

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Confirm", confirmClass = "add-btn", isLoading = false }) {
    return (
        <div className="modal-edit-product">
            <div className="modal-content">
                <h1>Confirm</h1>
                <p>{message}</p>
            </div>
            <div className="modal-buttons">
                <button className={confirmClass} onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? 'Loading...' : confirmLabel}
                </button>
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default ConfirmModal;