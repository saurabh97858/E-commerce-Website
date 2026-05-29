import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaVenusMars } from 'react-icons/fa';

const Auth = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Check if the current URL is /register or has ?tab=register to set initial tab
    const isRegisterRoute = location.pathname === '/register' || searchParams.get('tab') === 'register';
    const [isLogin, setIsLogin] = useState(!isRegisterRoute);

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register Form State
    const [registerData, setRegisterData] = useState({
        name: '', surname: '', email: '', password: '',
        address: '', city: '', pincode: '', gender: 'Male', mobile: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update isLogin state when URL changes (e.g. if back/forward button is clicked)
    useEffect(() => {
        const isReg = location.pathname === '/register' || searchParams.get('tab') === 'register';
        setIsLogin(!isReg);
        setError('');
        setSuccess('');
    }, [location.pathname, searchParams]);

    const handleTabChange = (targetIsLogin) => {
        setIsLogin(targetIsLogin);
        setError('');
        setSuccess('');
        navigate(targetIsLogin ? '/login' : '/register');
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const data = await login(loginEmail, loginPassword);
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                if (data.role === 'admin' || data.role === 'super_admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(registerData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                handleTabChange(true);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        }
    };

    return (
        <div className="auth-page">
            <div className={`auth-form-container ${isLogin ? 'login-mode' : 'register-mode'}`}>
                {/* Sliding Tabs */}
                <div className="auth-tabs-container">
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => handleTabChange(true)}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => handleTabChange(false)}
                        >
                            Create Account
                        </button>
                        <div
                            className="auth-tab-indicator"
                            style={{
                                transform: isLogin ? 'translateX(0)' : 'translateX(100%)',
                            }}
                        />
                    </div>
                </div>

                <div className="auth-content">
                    <h2 className="auth-title-text">
                        {isLogin ? 'Welcome Back' : 'Join SHOES'}
                    </h2>
                    <p className="auth-subtitle">
                        {isLogin
                            ? 'Enter your credentials to access your account'
                            : 'Sign up to shop the premium collection of shoes'}
                    </p>

                    {error && <div className="auth-alert error-msg">{error}</div>}
                    {success && <div className="auth-alert success-msg">{success}</div>}

                    {isLogin ? (
                        /* Login Form */
                        <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="label-row">
                                    <label>Password</label>
                                    <span className="forgot-password-link">Forgot password?</span>
                                </div>
                                <div className="input-with-icon">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-auth-submit">
                                Sign In
                            </button>
                        </form>
                    ) : (
                        /* Register Form (Two-Column Layout) */
                        <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade-in">
                            <div className="form-grid">
                                {/* Left Column: Personal info */}
                                <div className="form-column">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <div className="input-with-icon">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="John"
                                                    value={registerData.name}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Surname</label>
                                            <div className="input-with-icon">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    name="surname"
                                                    placeholder="Doe"
                                                    value={registerData.surname}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <div className="input-with-icon">
                                            <FaEnvelope className="input-icon" />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="john.doe@example.com"
                                                value={registerData.email}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Password</label>
                                        <div className="input-with-icon">
                                            <FaLock className="input-icon" />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="At least 6 characters"
                                                value={registerData.password}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mobile Number</label>
                                            <div className="input-with-icon">
                                                <FaPhone className="input-icon" />
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    placeholder="9876543210"
                                                    value={registerData.mobile}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <div className="input-with-icon select-wrapper">
                                                <FaVenusMars className="input-icon" />
                                                <select
                                                    name="gender"
                                                    value={registerData.gender}
                                                    onChange={handleRegisterChange}
                                                    required
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Address info */}
                                <div className="form-column">
                                    <div className="form-group">
                                        <label>Street Address</label>
                                        <div className="input-with-icon address-textarea-wrapper">
                                            <FaMapMarkerAlt className="input-icon textarea-icon" />
                                            <textarea
                                                name="address"
                                                placeholder="Apartment, suite, unit, building, street..."
                                                value={registerData.address}
                                                onChange={handleRegisterChange}
                                                rows="4"
                                                required
                                                style={{ resize: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City</label>
                                            <div className="input-with-icon">
                                                <FaMapMarkerAlt className="input-icon" />
                                                <input
                                                    type="text"
                                                    name="city"
                                                    placeholder="New Delhi"
                                                    value={registerData.city}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <div className="input-with-icon">
                                                <FaMapMarkerAlt className="input-icon" />
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    placeholder="110001"
                                                    value={registerData.pincode}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="terms-privacy-container">
                                        <p className="terms-privacy-text">
                                            By submitting this form, you agree to our{' '}
                                            <span className="terms-link">Terms of Service</span> and{' '}
                                            <span className="terms-link">Privacy Policy</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-auth-submit">
                                Create Account
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
