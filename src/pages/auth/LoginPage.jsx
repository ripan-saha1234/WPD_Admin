import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../context/context';
import { loginAdmin } from '../../services/authService';
import { mapUserFromApi, setAuthSession } from '../../utils/auth';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(globalContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      const { data } = await loginAdmin({
        email: formData.email,
        password: formData.password,
      });

      if (data.success === true) {
        setAuthSession(data.data.token, data.data.user);
        setUser(mapUserFromApi(data.data.user));
        navigate('/dashboard');
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.message || 'Invalid email or password',
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Network error. Please check your connection and try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="authentication-container">
      <div className="authentication-container-content">
        {/* <img src="/logo_wpd.svg" alt="WPD Admin" /> */}
        <h1>WPD Admin</h1>

        {errors.general && (
          <div className="authentication-error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="authentication-container-content-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'authentication-input-error-border' : ''}
            />
            {errors.email && (
              <span className="authentication-input-error">{errors.email}</span>
            )}
          </div>

          <div className="authentication-container-content-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'authentication-input-error-border' : ''}
            />
            {errors.password && (
              <span className="authentication-input-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="authentication-container-content-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
