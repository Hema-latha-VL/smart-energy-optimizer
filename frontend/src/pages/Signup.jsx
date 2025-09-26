import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Signup.css'

const Signup = () => {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const password = watch('password')
  const userType = watch('userType')

  // Custom email validation for community users
  const validateEmail = (email) => {
    if (userType === 'community') {
      const governmentDomains = ['@gov.in', '@nic.in', '@gov.org', '@government.in']
      const isGovernmentEmail = governmentDomains.some(domain => email.toLowerCase().endsWith(domain))
      if (!isGovernmentEmail) {
        return 'Only government officials can register as Community Admin. Please use a government email address ending with @gov.in'
      }
    }
    return true
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        userType: data.userType
      })
      if (result.success) {
        toast.success('Account created successfully!')
        navigate('/setup')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page-container">
      <div className="signup-form-wrapper">
        <div className="form-header text-center">
          <div className="icon-container">
            <span className="icon">⚡</span>
          </div>
          <h2 className="main-title">Create your account</h2>
          <p className="subtext">
            Or{' '}
            <Link to="/login" className="link-primary">sign in to your existing account</Link>
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className={`form-input${errors.name ? ' error' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                },
                validate: validateEmail
              })}
              className={`form-input${errors.email ? ' error' : ''}`}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="userType" className="form-label">Account Type</label>
            <select
              id="userType"
              {...register('userType', { required: 'Please select an account type' })}
              className={`form-select${errors.userType ? ' error' : ''}`}
            >
              <option value="">Select account type</option>
              <option value="individual">Individual - Personal Energy Management</option>
              <option value="community">Community Admin - Village Energy Management (Government Officials Only)</option>
            </select>
            {errors.userType && <p className="form-error">{errors.userType.message}</p>}
            {userType === 'community' && (
              <div className="community-notice">
                <p className="form-helper-text">
                  ⚠️ Community Admin accounts require government email domains (@gov.in, @nic.in, @government.in)
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`form-input${errors.password ? ' error' : ''}`}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className={`form-input${errors.confirmPassword ? ' error' : ''}`}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <div className="checkbox-group">
            <input
              id="agree-terms"
              type="checkbox"
              className="checkbox-input"
              required
            />
            <label htmlFor="agree-terms" className="checkbox-label">
              I agree to the{' '}
              <a href="#" className="link-primary">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="link-primary">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="link-primary font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
