import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset email sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} id="forgot-pw-form">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="forgot-submit-btn">
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-link">
              Remember your password? <Link to="/login">Log in here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
