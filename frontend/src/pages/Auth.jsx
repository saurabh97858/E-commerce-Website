import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaVenusMars, FaShoppingBag, FaStar, FaShieldAlt } from 'react-icons/fa';

const Auth = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const isRegisterRoute = location.pathname === '/register' || searchParams.get('tab') === 'register';
    const [isLogin, setIsLogin] = useState(!isRegisterRoute);

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
        const isReg = location.pathname === '/register' || searchParams.get('tab') === 'register';
        setIsLogin(!isReg);
        setError('');
        setSuccess('');
    }, [location.pathname, searchParams]);

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
                } catch (error) {
                    console.error("Error fetching registration PIN details:", error);
                }
            }
        };
        fetchCity();
    }, [registerData.pincode]);

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
        setIsSubmitting(true);
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
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => handleTabChange(true), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-v2">
            {/* LEFT PANEL — Animated Branding */}
            <div className="auth-left-panel">
                <div className="auth-panel-content">
                    <div className="auth-panel-logo">
                        <span className="auth-panel-logo-text">SOLESTREET</span>
                        <span className="auth-panel-logo-sub">PATNA</span>
                    </div>

                    <div className="auth-panel-headline">
                        {isLogin ? (
                            <>
                                <h2>Welcome<br /><span>Back!</span></h2>
                                <p>Step back into style. Your premium shoe collection awaits.</p>
                            </>
                        ) : (
                            <>
                                <h2>Join the<br /><span>Movement</span></h2>
                                <p>Discover premium footwear curated for the modern lifestyle.</p>
                            </>
                        )}
                    </div>

                    <div className="auth-panel-features">
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon"><FaStar /></div>
                            <div>
                                <strong>Premium Quality</strong>
                                <span>Handpicked shoes from top brands</span>
                            </div>
                        </div>
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon"><FaShoppingBag /></div>
                            <div>
                                <strong>Free Delivery</strong>
                                <span>On orders above ₹999</span>
                            </div>
                        </div>
                        <div className="auth-feature-item">
                            <div className="auth-feature-icon"><FaShieldAlt /></div>
                            <div>
                                <strong>Secure Shopping</strong>
                                <span>100% safe & encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating shoe illustration */}
                    <div className="auth-shoe-float">
                        <div className="auth-shoe-circle">👟</div>
                    </div>

                    {/* Decorative orbs */}
                    <div className="auth-orb auth-orb-1"></div>
                    <div className="auth-orb auth-orb-2"></div>
                    <div className="auth-orb auth-orb-3"></div>
                </div>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="auth-right-panel">
                <div className="auth-form-wrapper">

                    {/* Tabs */}
                    <div className="auth-tabs-v2">
                        <button
                            type="button"
                            className={`auth-tab-v2 ${isLogin ? 'active' : ''}`}
                            onClick={() => handleTabChange(true)}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`auth-tab-v2 ${!isLogin ? 'active' : ''}`}
                            onClick={() => handleTabChange(false)}
                        >
                            Create Account
                        </button>
                        <div
                            className="auth-tab-slider"
                            style={{ transform: isLogin ? 'translateX(0%)' : 'translateX(100%)' }}
                        />
                    </div>

                    {/* Title */}
                    <div className="auth-form-header">
                        <h3>{isLogin ? 'Sign in to your account' : 'Create your account'}</h3>
                        <p>{isLogin ? 'Enter your credentials below' : 'Fill in your details to get started'}</p>
                    </div>

                    {/* Alerts */}
                    {error && <div className="auth-alert-v2 error">{error}</div>}
                    {success && <div className="auth-alert-v2 success">{success}</div>}

                    {/* LOGIN FORM */}
                    {isLogin ? (
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
                                <div className="auth-field-row">
                                    <label>Password</label>
                                    <span className="auth-forgot">Forgot password?</span>
                                </div>
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
                                    Create one
                                </button>
                            </p>
                        </form>
                    ) : (
                        /* REGISTER FORM */
                        <form onSubmit={handleRegisterSubmit} className="auth-form-v2 auth-register-form">
                            <div className="auth-grid-2">
                                <div className="auth-field">
                                    <label>First Name</label>
                                    <div className="auth-input-wrap">
                                        <FaUser className="auth-input-icon" />
                                        <input type="text" name="name" placeholder="John" value={registerData.name} onChange={handleRegisterChange} required />
                                    </div>
                                </div>
                                <div className="auth-field">
                                    <label>Surname</label>
                                    <div className="auth-input-wrap">
                                        <FaUser className="auth-input-icon" />
                                        <input type="text" name="surname" placeholder="Doe" value={registerData.surname} onChange={handleRegisterChange} required />
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
                                    <input type="text" name="address" placeholder="Street, area..." value={registerData.address} onChange={handleRegisterChange} required />
                                </div>
                            </div>

                            <div className="auth-grid-2">
                                <div className="auth-field">
                                    <label>City</label>
                                    <div className="auth-input-wrap">
                                        <FaMapMarkerAlt className="auth-input-icon" />
                                        <input type="text" name="city" placeholder="New Delhi" value={registerData.city} onChange={handleRegisterChange} required />
                                    </div>
                                </div>
                                <div className="auth-field">
                                    <label>Pincode</label>
                                    <div className="auth-input-wrap">
                                        <FaMapMarkerAlt className="auth-input-icon" />
                                        <input type="text" name="pincode" placeholder="110001" value={registerData.pincode} onChange={handleRegisterChange} required />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? <span className="auth-spinner"></span> : 'Create Account'}
                            </button>

                            <p className="auth-switch-text">
                                Already have an account?{' '}
                                <button type="button" onClick={() => handleTabChange(true)} className="auth-switch-link">
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
