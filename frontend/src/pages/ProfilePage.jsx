import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setUpdating(true);
    try {
      const api = (await import('../api/axios')).default;
      await updateProfile({ name, phone });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordUpdating(true);
    try {
      const api = (await import('../api/axios')).default;
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Profile Info Form */}
        <div className="card-glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Personal Information</h3>
          <form onSubmit={handleProfileUpdate} id="profile-form">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address (Non-editable)</label>
              <input
                type="email"
                id="profile-email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                type="text"
                id="profile-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Phone Number</label>
              <input
                type="text"
                id="profile-phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={updating} id="save-profile-btn">
              {updating ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card-glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Change Password</h3>
          <form onSubmit={handlePasswordChange} id="password-form">
            <div className="form-group">
              <label className="form-label" htmlFor="current-pw">Current Password</label>
              <input
                type="password"
                id="current-pw"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">New Password</label>
              <input
                type="password"
                id="new-pw"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
              <input
                type="password"
                id="confirm-pw"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-outline" disabled={passwordUpdating} id="change-pw-btn">
              {passwordUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
