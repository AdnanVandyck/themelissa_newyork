import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminRegistration.css';

const PublicRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    invitationCode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const feedback = [];
    
    if (!checks.length) feedback.push('At least 8 characters');
    if (!checks.uppercase) feedback.push('One uppercase letter');
    if (!checks.lowercase) feedback.push('One lowercase letter');
    if (!checks.numbers) feedback.push('One number');
    if (!checks.special) feedback.push('One special character');
    
    return { score, feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Check password strength in real-time
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear confirm password error when passwords match
    if (name === 'confirmPassword' && formData.password === value) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 5) {
      newErrors.password = 'Password does not meet strength requirements';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role validation
    if (!['staff', 'manager', 'admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }
    
    // Invitation code validation for admin role
    if (formData.role === 'admin' && !formData.invitationCode.trim()) {
      newErrors.invitationCode = 'Invitation code is required for admin role';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('🚀 Submitting public registration form...');
      
      // Use direct fetch to ensure POST request
      const response = await fetch('http://localhost:5000/api/auth/register-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          invitationCode: formData.invitationCode.trim()
        }),
      });
      
      const data = await response.json();
      console.log('✅ Registration response:', data);
      
      if (response.ok && data.success) {
        setSuccess({
          user: data.user,
          emailSent: data.emailSent
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'staff',
          invitationCode: ''
        });
        setPasswordStrength({ score: 0, feedback: [] });
        
        console.log('✅ Registration successful for:', data.user.email);
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!success.user?.email) return;
    
    try {
      console.log('📧 Resending verification email to:', success.user.email);
      
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: success.user.email
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Verification email sent successfully! Please check your inbox.');
      } else {
        alert(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Network error. Please try again.');
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return '#dc3545';
    if (score <= 3) return '#fd7e14';
    if (score <= 4) return '#ffc107';
    return '#28a745';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'staff':
        return 'Basic access - View units, contacts, and gallery';
      case 'manager':
        return 'Extended permissions - Manage units and contacts';
      case 'admin':
        return 'Full management access - All permissions (requires invitation code)';
      default:
        return '';
    }
  };

  if (success) {
    return (
      <div className="registration-container">
        <div className="registration-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p>
              Welcome to The Melissa NYC, <strong>{success.user.firstName} {success.user.lastName}</strong>!
            </p>
            <p>
              Your account has been created with email <strong>{success.user.email}</strong>.
            </p>
            
            <div className="process-steps">
              <h4>Next Steps:</h4>
              <div className="step-list">
                <div className="step completed">
                  <span className="step-number">1</span>
                  <span className="step-text">Account Created ✓</span>
                </div>
                <div className="step current">
                  <span className="step-number">2</span>
                  <span className="step-text">Check your email and click the verification link</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span className="step-text">Wait for admin approval (you'll get another email)</span>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <span className="step-text">Login and start managing properties</span>
                </div>
              </div>
            </div>

            {success.emailSent ? (
              <div className="success-message-details">
                <p>📧 Verification email sent successfully! Please check your inbox and spam folder.</p>
              </div>
            ) : (
              <div className="warning-message">
                <p><strong>Note:</strong> There was an issue sending the verification email. 
                You can resend it using the button below.</p>
              </div>
            )}
            
            <div className="success-actions">
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
              <button 
                onClick={handleResendVerification}
                className="btn btn-secondary"
                disabled={!success.user?.email}
              >
                Resend Verification Email
              </button>
            </div>
            
            <div className="account-details">
              <h4>Account Summary:</h4>
              <div className="details-grid">
                <div><strong>Role:</strong> {success.user.role.charAt(0).toUpperCase() + success.user.role.slice(1)}</div>
                <div><strong>Status:</strong> Pending Email Verification</div>
                <div><strong>Username:</strong> @{success.user.username}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Join The Melissa NYC</h1>
          <p>Create your admin account to manage luxury properties</p>
          <div className="header-note">
            <small>All new accounts require email verification and admin approval</small>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          {errors.submit && (
            <div className="error-message">
              <strong>Registration Failed:</strong> {errors.submit}
            </div>
          )}
          
          {/* Name Fields Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
                disabled={loading}
                maxLength={50}
                required
              />
              {errors.firstName && (
                <span className="field-error">{errors.firstName}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
                disabled={loading}
                maxLength={50}
                required
              />
              {errors.lastName && (
                <span className="field-error">{errors.lastName}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'error' : ''}
              placeholder="Choose a unique username (letters, numbers, underscore only)"
              disabled={loading}
              maxLength={30}
              required
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
              disabled={loading}
              required
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Requested Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={errors.role ? 'error' : ''}
              disabled={loading}
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <small className="field-help">
              {getRoleDescription(formData.role)}
            </small>
            {errors.role && (
              <span className="field-error">{errors.role}</span>
            )}
          </div>
          
          {formData.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="invitationCode">Admin Invitation Code *</label>
              <input
                type="text"
                id="invitationCode"
                name="invitationCode"
                value={formData.invitationCode}
                onChange={handleInputChange}
                className={errors.invitationCode ? 'error' : ''}
                placeholder="Enter admin invitation code"
                disabled={loading}
                required
              />
              <small className="field-help">
                Required for admin role registration. Contact your administrator if you don't have this code.
              </small>
              {errors.invitationCode && (
                <span className="field-error">{errors.invitationCode}</span>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a strong password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                    }}
                  />
                </div>
                <span 
                  className="strength-text"
                  style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                >
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
            )}
            
            {passwordStrength.feedback.length > 0 && (
              <div className="password-requirements">
                <small>Password must include:</small>
                <ul>
                  {passwordStrength.feedback.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || passwordStrength.score < 5}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="registration-footer">
            <p>
              Already have an account? <button type="button" onClick={() => navigate('/login')} className="link-button">Sign in here</button>
            </p>
            <p>
              <small>
                By creating an account, you agree to our terms of service and privacy policy.
              </small>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicRegistration;