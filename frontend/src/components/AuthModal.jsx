import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaVenusMars, FaTimes } from 'react-icons/fa';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(initialTab === 'login');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerData, setRegisterData] = useState({
        name: '', surname: '', email: '', password: '',
        address: '', city: '', pincode: '', gender: 'Male', mobile: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLogin(initialTab === 'login');
        setError('');
        setSuccess('');
    }, [initialTab, isOpen]);

    /* Auto-fetch City from PIN Code in Registration */
    useEffect(() => {
        const fetchCity = async () => {
            if (registerData.pincode && registerData.pincode.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${registerData.pincode}`);
                    const data = await response.json();
                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
                        const postOffice = data[0].PostOffice[0];
                        setRegisterData(prev => ({
                            ...prev,
                            city: postOffice.District || postOffice.Division || ''
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching PIN details:", err);
                }
            }
        };
        fetchCity();
    }, [registerData.pincode]);

    if (!isOpen) return null;

    const handleTabChange = (targetIsLogin) => {
        setIsLogin(targetIsLogin);
        setError('');
        setSuccess('');
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            await login(loginEmail, loginPassword);
            setSuccess('Login successful!');
            setTimeout(() => {
                onClose();
            }, 600);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            await register(registerData);
            setSuccess('Registration successful! Switching to Sign In...');
            setTimeout(() => {
                handleTabChange(true);
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-modal-backdrop" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
                    <FaTimes />
                </button>

                {/* Tabs */}
                <div className="auth-modal-tabs">
                    <button
                        type="button"
                        className={`auth-modal-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => handleTabChange(true)}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={`auth-modal-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => handleTabChange(false)}
                    >
                        Create Account
                    </button>
                </div>

                <div className="auth-modal-header">
                    <h3>{isLogin ? 'Welcome Back!' : 'Join SoleStreet Patna'}</h3>
                    <p>{isLogin ? 'Sign in to access your orders and wishlist' : 'Fill in your details to create an account'}</p>
                </div>

                {error && <div className="auth-alert-v2 error">{error}</div>}
                {success && <div className="auth-alert-v2 success">{success}</div>}

                {isLogin ? (
                    /* SIGN IN FORM */
                    <form onSubmit={handleLoginSubmit} className="auth-form-v2">
                        <div className="auth-field">
                            <label>Email Address</label>
                            <div className="auth-input-wrap">
                                <FaEnvelope className="auth-input-icon" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-input-wrap">
                                <FaLock className="auth-input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? <span className="auth-spinner"></span> : 'Sign In'}
                        </button>

                        <p className="auth-switch-text">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => handleTabChange(false)} className="auth-switch-link">
                                Create one here
                            </button>
                        </p>
                    </form>
                ) : (
                    /* CREATE ACCOUNT FORM */
                    <form onSubmit={handleRegisterSubmit} className="auth-form-v2 auth-register-form">
                        <div className="auth-grid-2">
                            <div className="auth-field">
                                <label>First Name</label>
                                <div className="auth-input-wrap">
                                    <FaUser className="auth-input-icon" />
                                    <input type="text" name="name" placeholder="First Name" value={registerData.name} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>Surname</label>
                                <div className="auth-input-wrap">
                                    <FaUser className="auth-input-icon" />
                                    <input type="text" name="surname" placeholder="Surname" value={registerData.surname} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Email Address</label>
                            <div className="auth-input-wrap">
                                <FaEnvelope className="auth-input-icon" />
                                <input type="email" name="email" placeholder="john@example.com" value={registerData.email} onChange={handleRegisterChange} required />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-input-wrap">
                                <FaLock className="auth-input-icon" />
                                <input type="password" name="password" placeholder="At least 6 characters" value={registerData.password} onChange={handleRegisterChange} required />
                            </div>
                        </div>

                        <div className="auth-grid-2">
                            <div className="auth-field">
                                <label>Mobile</label>
                                <div className="auth-input-wrap">
                                    <FaPhone className="auth-input-icon" />
                                    <input type="text" name="mobile" placeholder="9876543210" value={registerData.mobile} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>Gender</label>
                                <div className="auth-input-wrap">
                                    <FaVenusMars className="auth-input-icon" />
                                    <select name="gender" value={registerData.gender} onChange={handleRegisterChange} required>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Street Address</label>
                            <div className="auth-input-wrap">
                                <FaMapMarkerAlt className="auth-input-icon" />
                                <input type="text" name="address" placeholder="House no, Street, Area" value={registerData.address} onChange={handleRegisterChange} required />
                            </div>
                        </div>

                        <div className="auth-grid-2">
                            <div className="auth-field">
                                <label>Pincode (Auto Lookup)</label>
                                <div className="auth-input-wrap">
                                    <FaMapMarkerAlt className="auth-input-icon" />
                                    <input type="text" name="pincode" placeholder="800001" maxLength="6" value={registerData.pincode} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>City</label>
                                <div className="auth-input-wrap">
                                    <FaMapMarkerAlt className="auth-input-icon" />
                                    <input type="text" name="city" placeholder="Patna" value={registerData.city} onChange={handleRegisterChange} required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? <span className="auth-spinner"></span> : 'Create Account'}
                        </button>

                        <p className="auth-switch-text">
                            Already have an account?{' '}
                            <button type="button" onClick={() => handleTabChange(true)} className="auth-switch-link">
                                Sign in here
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
