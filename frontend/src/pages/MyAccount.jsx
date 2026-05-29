import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaMapMarkerAlt, FaCity, FaEdit } from 'react-icons/fa';

const MyAccount = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/auth/profile');
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError(error.response?.data?.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="pro-page"><div className="error-msg">{error}</div></div>;

    const profileFields = [
        { icon: <FaUser />, label: 'Full Name', value: `${profile.name} ${profile.surname}` },
        { icon: <FaEnvelope />, label: 'Email Address', value: profile.email },
        { icon: <FaPhone />, label: 'Mobile Number', value: profile.mobile },
        { icon: <FaVenusMars />, label: 'Gender', value: profile.gender },
        { icon: <FaMapMarkerAlt />, label: 'Address', value: profile.address },
        { icon: <FaCity />, label: 'City', value: profile.city },
        { icon: <FaMapMarkerAlt />, label: 'Pincode', value: profile.pincode },
    ];

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaUser className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">My Account</h1>
                        <p className="pro-page-subtitle">Manage your profile information</p>
                    </div>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-lg">
                        {profile.name.charAt(0)}{profile.surname?.charAt(0) || ''}
                    </div>
                    <h2 className="profile-fullname">{profile.name} {profile.surname}</h2>
                    <span className="profile-role-badge">{profile.role?.replace('_', ' ') || 'Customer'}</span>
                </div>
                <div className="profile-fields">
                    {profileFields.map((field, i) => (
                        <div className="profile-field" key={i}>
                            <div className="profile-field-icon">{field.icon}</div>
                            <div className="profile-field-content">
                                <span className="profile-field-label">{field.label}</span>
                                <span className="profile-field-value">{field.value || '—'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyAccount;
