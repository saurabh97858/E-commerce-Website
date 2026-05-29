import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaShieldAlt, FaKey } from 'react-icons/fa';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { changePassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        try {
            await changePassword(currentPassword, newPassword);
            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    return (
        <div className="pro-page pro-page-narrow">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaKey className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Change Password</h1>
                        <p className="pro-page-subtitle">Update your account security</p>
                    </div>
                </div>
            </div>

            <div className="form-card">
                <div className="secure-badge" style={{ marginBottom: '20px' }}>
                    <FaShieldAlt /> Your password is encrypted and secure
                </div>
                {error && <div className="error-msg">{error}</div>}
                {message && <div className="success-msg">{message}</div>}
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-group">
                        <label><FaLock style={{ marginRight: '6px', fontSize: '12px' }} /> Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
                    </div>
                    <div className="form-group">
                        <label><FaLock style={{ marginRight: '6px', fontSize: '12px' }} /> New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required />
                    </div>
                    <div className="form-group">
                        <label><FaLock style={{ marginRight: '6px', fontSize: '12px' }} /> Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required />
                    </div>
                    <button type="submit" className="btn-checkout">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
