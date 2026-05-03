import React, { useState } from 'react';

function ExportPasswordModal({ onConfirm, onCancel, isLoading, error }) {
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleConfirm = () => {
        if (!password) {
            setLocalError("Password is required.");
            return;
        }

        setLocalError(''); // clear local error
        onConfirm(password);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleConfirm();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ minWidth: '340px', maxWidth: '420px' }}>
                <div style={{ padding: '10px 10px 0' }}>
                    <h1 style={{ margin: '0 0 8px' }}>Confirm Export</h1>
                    <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#444' }}>
                        Enter your password to authorize this export.
                    </p>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        className={(error || localError) ? 'input-error' : ''}
                        style={{ width: '90%' }}
                        onChange={e => {
                            setPassword(e.target.value);
                            setLocalError(''); // clear error while typing
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />

                    {(error || localError) && (
                        <span className="error-msg">{localError || error}</span>
                    )}
                </div>
                <div className="modal-buttons" style={{ display: 'flex', gap: '10px', padding: '16px 10px 10px' }}>
                    <button
                        className="add-btn"
                        onClick={handleConfirm}
                        // disabled={isLoading || !password}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Export'}
                    </button>
                    <button className="cancel-btn" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportPasswordModal;
