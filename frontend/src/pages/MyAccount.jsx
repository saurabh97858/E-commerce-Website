import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyAccount = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/auth/profile');
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    if (!profile) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <h2 className="page-title">My Account</h2>
            <div className="account-details">
                <table className="data-table">
                    <tbody>
                        <tr><th>Name</th><td>{profile.name} {profile.surname}</td></tr>
                        <tr><th>Email</th><td>{profile.email}</td></tr>
                        <tr><th>Mobile</th><td>{profile.mobile}</td></tr>
                        <tr><th>Gender</th><td>{profile.gender}</td></tr>
                        <tr><th>Address</th><td>{profile.address}</td></tr>
                        <tr><th>City</th><td>{profile.city}</td></tr>
                        <tr><th>Pincode</th><td>{profile.pincode}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyAccount;
