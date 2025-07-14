import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/AdminRegistration.css';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided');
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verifying email token:', token);

      const response = await authAPI.verifyEmail(token);
      const data = response.data;

      console.log('✅ Email verification response:', data);

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setUserInfo(data.user);
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      
      const errorMessage = error.response?.data?.message || error.message;
      
      // Check for specific error types
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid or expired')) {
        setStatus('expired');
        setMessage('Your verification link has expired. Please request a new one.');
      } else if (errorMessage.includes('already verified')) {
        setStatus('already-verified');
        setMessage('Your email is already verified. You can proceed to login.');
      } else {
        setStatus('error');
        setMessage(errorMessage || 'Email verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    // Extract email from user info or redirect to resend page
    if (userInfo?.email) {
      navigate('/resend-verification', { 
        state: { email: userInfo.email } 
      });
    } else {
      navigate('/resend-verification');
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Maximum retry attempts reached. Please request a new verification email.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="registration-container">
        <div className="registration-card">
          <div className="verification-loading">
            <div className="loading-spinner-large"></div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <small>This usually takes just a moment</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="registration-container">
        <div className="registration-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            
            {userInfo && (
              <div className="user-info-card">
                <h4>Account Details:</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">{userInfo.firstName} {userInfo.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Username:</span>
                    <span className="value">@{userInfo.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{userInfo.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Role:</span>
                    <span className="value role-badge">{userInfo.role}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="next-steps">
              <h4>What's Next?</h4>
              <div className="step-list">
                <div className="step completed">
                  <span className="step-number">1</span>
                  <span className="step-text">Account Created ✓</span>
                </div>
                <div className="step completed">
                  <span className="step-number">2</span>
                  <span className="step-text">Email Verified ✓</span>
                </div>
                <div className="step current">
                  <span className="step-number">3</span>
                  <span className="step-text">Waiting for Admin Approval</span>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <span className="step-text">Login and Start Managing</span>
                </div>
              </div>
              
              <p className="approval-note">
                🕐 Your account is now pending admin approval. You'll receive another email 
                once your account is activated and ready to use.
              </p>
            </div>

            <div className="success-actions">
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already verified state
  if (status === 'already-verified') {
    return (
      <div className="registration-container">
        <div className="registration-card">
          <div className="info-message">
            <div className="info-icon">ℹ️</div>
            <h2>Email Already Verified</h2>
            <p>{message}</p>
            
            <div className="info-actions">
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-secondary">
                Register New Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expired token state
  if (status === 'expired') {
    return (
      <div className="registration-container">
        <div className="registration-card">
          <div className="warning-message">
            <div className="warning-icon">⚠️</div>
            <h2>Verification Link Expired</h2>
            <p>{message}</p>
            
            <div className="expired-info">
              <p>Verification links expire after 24 hours for security reasons.</p>
              <p>Don't worry - you can easily request a new verification email!</p>
            </div>

            <div className="warning-actions">
              <button onClick={handleResendVerification} className="btn btn-primary">
                Send New Verification Email
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-secondary">
                Register Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="error-message-card">
          <div className="error-icon">✗</div>
          <h2>Email Verification Failed</h2>
          <p>{message}</p>
          
          <div className="error-details">
            <details>
              <summary>Technical Details</summary>
              <div className="tech-details">
                <p><strong>Token:</strong> {token ? `${token.substring(0, 8)}...` : 'Not provided'}</p>
                <p><strong>Retry Count:</strong> {retryCount}/3</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            </details>
          </div>

          <div className="error-actions">
            {retryCount < 3 ? (
              <button onClick={handleRetry} className="btn btn-secondary">
                Try Again ({3 - retryCount} attempts left)
              </button>
            ) : null}
            
            <button onClick={handleResendVerification} className="btn btn-primary">
              Request New Verification Email
            </button>
            
            <button onClick={() => navigate('/register')} className="btn btn-secondary">
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;