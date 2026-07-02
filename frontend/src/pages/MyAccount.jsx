import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaMapMarkerAlt, FaCity, FaEdit, FaCheck, FaTimes, FaTrashAlt } from 'react-icons/fa';

const MyAccount = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        mobile: '',
        address: '',
        city: '',
        pincode: ''
    });

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            setProfile(data);
            setEditData({
                mobile: data.mobile || '',
                address: data.address || '',
                city: data.city || '',
                pincode: data.pincode || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.response?.data?.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    /* Auto-fetch City from PIN Code in Profile Edit */
    useEffect(() => {
        const fetchCity = async () => {
            if (editData.pincode && editData.pincode.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${editData.pincode}`);
                    const data = await response.json();
                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
                        const postOffice = data[0].PostOffice[0];
                        setEditData(prev => ({
                            ...prev,
                            city: postOffice.District || postOffice.Division || ''
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching PIN details inside profile:", err);
                }
            }
        };
        fetchCity();
    }, [editData.pincode]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="pro-page"><div className="error-msg">{error}</div></div>;

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const { data } = await API.put('/auth/profile', editData);
            setProfile(data.user);
            setSuccess('Address and mobile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update address details.');
        }
    };

    const handleDeleteAddress = async () => {
        if (window.confirm("Are you sure you want to clear/delete your saved address?")) {
            setError(null);
            setSuccess(null);
            try {
                const clearedData = {
                    mobile: editData.mobile,
                    address: 'No saved address',
                    city: 'N/A',
                    pincode: '000000'
                };
                const { data } = await API.put('/auth/profile', clearedData);
                setProfile(data.user);
                setEditData(clearedData);
                setSuccess('Saved address cleared!');
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to clear saved address.');
            }
        }
    };

    const profileFields = [
        { icon: <FaUser />, label: 'Full Name', value: `${profile.name} ${profile.surname}` },
        { icon: <FaEnvelope />, label: 'Email Address', value: profile.email },
        { icon: <FaVenusMars />, label: 'Gender', value: profile.gender },
    ];

    return (
        <div className="pro-page" style={{ maxWidth: '680px', margin: '20px auto' }}>
            <div className="pro-page-header" style={{ marginBottom: '16px' }}>
                <div className="pro-page-header-left">
                    <FaUser className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title" style={{ fontSize: '18px' }}>My Account</h1>
                        <p className="pro-page-subtitle" style={{ fontSize: '11px' }}>Manage your profile and shipping address</p>
                    </div>
                </div>
            </div>

            {success && <div className="success-msg" style={{ fontSize: '12px', padding: '8px 12px', marginBottom: '12px' }}>{success}</div>}
            {error && <div className="error-msg" style={{ fontSize: '12px', padding: '8px 12px', marginBottom: '12px' }}>{error}</div>}

            <div className="profile-card" style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                <div className="profile-avatar-section" style={{ marginBottom: '16px' }}>
                    <div className="profile-avatar-lg" style={{ width: '60px', height: '60px', fontSize: '20px' }}>
                        {profile.name.charAt(0)}{profile.surname?.charAt(0) || ''}
                    </div>
                    <h2 className="profile-fullname" style={{ fontSize: '16px', marginTop: '8px' }}>{profile.name} {profile.surname}</h2>
                    <span className="profile-role-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>{profile.role?.replace('_', ' ') || 'Customer'}</span>
                </div>

                <div className="profile-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Read Only General Fields */}
                    {profileFields.map((field, i) => (
                        <div className="profile-field" key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="profile-field-icon" style={{ fontSize: '13px', color: 'var(--primary)' }}>{field.icon}</div>
                            <div className="profile-field-content">
                                <span className="profile-field-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{field.label}</span>
                                <span className="profile-field-value" style={{ fontSize: '12.5px' }}>{field.value || '—'}</span>
                            </div>
                        </div>
                    ))}

                    <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />

                    {/* Editable Address Section */}
                    {!isEditing ? (
                        <>
                            <div className="profile-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="profile-field-icon" style={{ fontSize: '13px', color: 'var(--primary)' }}><FaPhone /></div>
                                <div className="profile-field-content">
                                    <span className="profile-field-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mobile Number</span>
                                    <span className="profile-field-value" style={{ fontSize: '12.5px' }}>{profile.mobile || '—'}</span>
                                </div>
                            </div>
                            <div className="profile-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="profile-field-icon" style={{ fontSize: '13px', color: 'var(--primary)' }}><FaMapMarkerAlt /></div>
                                <div className="profile-field-content">
                                    <span className="profile-field-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Saved Address</span>
                                    <span className="profile-field-value" style={{ fontSize: '12.5px' }}>{profile.address || 'No saved address'}</span>
                                </div>
                            </div>
                            <div className="profile-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="profile-field-icon" style={{ fontSize: '13px', color: 'var(--primary)' }}><FaCity /></div>
                                <div className="profile-field-content">
                                    <span className="profile-field-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>City / State</span>
                                    <span className="profile-field-value" style={{ fontSize: '12.5px' }}>{profile.city || '—'}</span>
                                </div>
                            </div>
                            <div className="profile-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="profile-field-icon" style={{ fontSize: '13px', color: 'var(--primary)' }}><FaMapMarkerAlt /></div>
                                <div className="profile-field-content">
                                    <span className="profile-field-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pincode</span>
                                    <span className="profile-field-value" style={{ fontSize: '12.5px' }}>{profile.pincode || '—'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="view-link"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        fontSize: '11.5px',
                                        cursor: 'pointer',
                                        border: 'none'
                                    }}
                                >
                                    <FaEdit /> Edit Address & Contact
                                </button>
                                {profile.address && profile.address !== 'No saved address' && (
                                    <button
                                        onClick={handleDeleteAddress}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 14px',
                                            fontSize: '11.5px',
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'rgba(231, 76, 60, 0.1)',
                                            color: 'var(--danger)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                    >
                                        <FaTrashAlt /> Delete Saved Address
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700' }}>Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={editData.mobile}
                                    onChange={handleInputChange}
                                    style={{ padding: '6px 10px', fontSize: '11.5px', height: '30px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700' }}>Address (Street, Area, Landmark)</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editData.address}
                                    onChange={handleInputChange}
                                    style={{ padding: '6px 10px', fontSize: '11.5px', height: '30px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700' }}>Pincode (Auto Lookup)</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    maxLength="6"
                                    value={editData.pincode}
                                    onChange={handleInputChange}
                                    style={{ padding: '6px 10px', fontSize: '11.5px', height: '30px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700' }}>City / District</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={editData.city}
                                    onChange={handleInputChange}
                                    style={{ padding: '6px 10px', fontSize: '11.5px', height: '30px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="submit"
                                    className="view-link"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        fontSize: '11.5px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'var(--primary)',
                                        color: 'white'
                                    }}
                                >
                                    <FaCheck /> Save Address
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            mobile: profile.mobile || '',
                                            address: profile.address || '',
                                            city: profile.city || '',
                                            pincode: profile.pincode || ''
                                        });
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        fontSize: '11.5px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAccount;
