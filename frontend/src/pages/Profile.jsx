import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import './Profile.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [communityDevices, setCommunityDevices] = useState([])
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('renewableResource', user.setupData?.renewableResource || '')
      setValue('totalCapacity', user.setupData?.totalCapacity || '')
      setValue('villageName', user.setupData?.villageName || '')
      setValue('totalHouseholds', user.setupData?.totalHouseholds || '')
      setValue('dailyEnergyAvailable', user.setupData?.dailyEnergyAvailable || '')
      setValue('allocationPercentage', user.setupData?.allocationPercentage || '')
      setValue('location.latitude', user.location?.latitude || '')
      setValue('location.longitude', user.location?.longitude || '')
      setValue('location.address', user.location?.address || '')
      
      if (user.setupData?.devices) {
        setDevices(user.setupData.devices)
      }
      if (user.setupData?.communityDevices) {
        setCommunityDevices(user.setupData.communityDevices)
      }
    }
  }, [user, setValue])

  const addDevice = () => {
    setDevices([...devices, { name: '', power: '' }])
  }

  const removeDevice = (index) => {
    setDevices(devices.filter((_, i) => i !== index))
  }

  const updateDevice = (index, field, value) => {
    const updatedDevices = [...devices]
    updatedDevices[index][field] = value
    setDevices(updatedDevices)
  }

  const addCommunityDevice = () => {
    setCommunityDevices([...communityDevices, { name: '', power: '', count: 1, hoursPerDay: 8 }])
  }

  const removeCommunityDevice = (index) => {
    setCommunityDevices(communityDevices.filter((_, i) => i !== index))
  }

  const updateCommunityDevice = (index, field, value) => {
    const updatedDevices = [...communityDevices]
    updatedDevices[index][field] = value
    setCommunityDevices(updatedDevices)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        setupData: {
          renewableResource: data.renewableResource,
          totalCapacity: parseFloat(data.totalCapacity),
          villageName: data.villageName,
          devices: devices.map(device => ({
            name: device.name,
            power: parseFloat(device.power)
          })),
          totalHouseholds: data.totalHouseholds ? parseInt(data.totalHouseholds) : undefined,
          dailyEnergyAvailable: data.dailyEnergyAvailable ? parseFloat(data.dailyEnergyAvailable) : undefined,
          allocationPercentage: data.allocationPercentage ? parseFloat(data.allocationPercentage) : undefined,
          communityDevices: communityDevices.map(device => ({
            name: device.name,
            power: parseFloat(device.power),
            count: parseInt(device.count) || 1,
            hoursPerDay: parseFloat(device.hoursPerDay) || 8
          }))
        },
        location: {
          latitude: data.location?.latitude ? parseFloat(data.location.latitude) : null,
          longitude: data.location?.longitude ? parseFloat(data.location.longitude) : null,
          address: data.location?.address
        }
      }

      const response = await api.put('/setup', updateData)
      
      updateUser({
        ...user,
        name: data.name,
        email: data.email,
        setupData: response.data.setupData,
        location: response.data.location
      })
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">
            Manage your account information and energy system configuration
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
          <div className="profile-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Personal Information</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Energy System Configuration</h2>
              </div>
              <div className="form-content">
                {user?.userType === 'individual' && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="renewableResource" className="form-label">
                        Renewable Energy Resource
                      </label>
                      <select
                        id="renewableResource"
                        className={`form-select ${errors.renewableResource ? 'form-input-error' : ''}`}
                        {...register('renewableResource', {
                          required: 'Please select a renewable resource'
                        })}
                      >
                        <option value="">Select resource type</option>
                        <option value="solar">Solar Panels</option>
                        <option value="wind">Wind Turbine</option>
                      </select>
                      {errors.renewableResource && (
                        <p className="form-error">{errors.renewableResource.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="totalCapacity" className="form-label">
                        Total Installed Capacity
                      </label>
                      <div className="input-with-unit">
                        <input
                          id="totalCapacity"
                          type="number"
                          step="0.1"
                          min="0"
                          className={`form-input ${errors.totalCapacity ? 'form-input-error' : ''}`}
                          {...register('totalCapacity', {
                            required: 'Capacity is required',
                            min: { value: 0.1, message: 'Capacity must be greater than 0' }
                          })}
                        />
                        <span className="input-unit">kWh</span>
                      </div>
                      {errors.totalCapacity && (
                        <p className="form-error">{errors.totalCapacity.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {user?.userType === 'community' && (
                  <div>
                    <div className="form-group">
                      <label htmlFor="villageName" className="form-label">
                        Village/Community Name
                      </label>
                      <input
                        id="villageName"
                        type="text"
                        className={`form-input ${errors.villageName ? 'form-input-error' : ''}`}
                        {...register('villageName', {
                          required: 'Village name is required'
                        })}
                      />
                      {errors.villageName && (
                        <p className="form-error">{errors.villageName.message}</p>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="totalHouseholds" className="form-label">
                          Total Households
                        </label>
                        <input
                          id="totalHouseholds"
                          type="number"
                          min="1"
                          className={`form-input ${errors.totalHouseholds ? 'form-input-error' : ''}`}
                          {...register('totalHouseholds', {
                            required: 'Total households is required',
                            min: { value: 1, message: 'Must have at least 1 household' }
                          })}
                        />
                        {errors.totalHouseholds && (
                          <p className="form-error">{errors.totalHouseholds.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="dailyEnergyAvailable" className="form-label">
                          Daily Energy Available
                        </label>
                        <div className="input-with-unit">
                          <input
                            id="dailyEnergyAvailable"
                            type="number"
                            step="0.1"
                            min="0"
                            className={`form-input ${errors.dailyEnergyAvailable ? 'form-input-error' : ''}`}
                            {...register('dailyEnergyAvailable', {
                              required: 'Daily energy capacity is required',
                              min: { value: 0.1, message: 'Energy must be greater than 0' }
                            })}
                          />
                          <span className="input-unit">Wh</span>
                        </div>
                        {errors.dailyEnergyAvailable && (
                          <p className="form-error">{errors.dailyEnergyAvailable.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="allocationPercentage" className="form-label">
                        Household Allocation Percentage
                      </label>
                      <div className="input-with-unit">
                        <input
                          id="allocationPercentage"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          defaultValue="70"
                          className={`form-input ${errors.allocationPercentage ? 'form-input-error' : ''}`}
                          {...register('allocationPercentage', {
                            min: { value: 0, message: 'Percentage must be 0 or greater' },
                            max: { value: 100, message: 'Percentage cannot exceed 100' }
                          })}
                        />
                        <span className="input-unit">%</span>
                      </div>
                      <p className="form-help">
                        Percentage of remaining energy (after community devices) allocated to households
                      </p>
                      {errors.allocationPercentage && (
                        <p className="form-error">{errors.allocationPercentage.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {user?.userType === 'individual' && (
                  <div className="form-group">
                    <label htmlFor="villageNameOptional" className="form-label">
                      Village/Community Name (Optional)
                    </label>
                    <input
                      id="villageNameOptional"
                      type="text"
                      className="form-input"
                      {...register('villageName')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Location</h2>
                <p className="section-subtitle">
                  Location helps provide accurate weather-based predictions
                </p>
              </div>
              <div className="form-content">
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address (Optional)
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="form-input"
                    placeholder="Enter your address"
                    {...register('location.address')}
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="latitude" className="form-label">Latitude</label>
                    <input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      className="form-input"
                      placeholder="e.g., 40.7128"
                      {...register('location.latitude')}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="longitude" className="form-label">Longitude</label>
                    <input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      className="form-input"
                      placeholder="e.g., -74.0060"
                      {...register('location.longitude')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {user?.userType === 'individual' && (
            <div className="profile-section">
              <div className="section-card">
                <div className="section-header">
                  <div className="section-header-content">
                    <div>
                      <h2 className="section-title">Devices</h2>
                      <p className="section-subtitle">
                        Manage your energy-consuming devices
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addDevice}
                      className="btn btn-outline btn-sm"
                    >
                      Add Device
                    </button>
                  </div>
                </div>
                
                <div className="form-content">
                  {devices.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-state-text">No devices configured</p>
                      <p className="empty-state-subtext">Click "Add Device" to get started</p>
                    </div>
                  ) : (
                    <div className="devices-list">
                      {devices.map((device, index) => (
                        <div key={index} className="device-item">
                          <div className="device-form-group">
                            <label className="form-label">Device Name</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g., Washing Machine"
                              value={device.name}
                              onChange={(e) => updateDevice(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="device-form-group">
                            <label className="form-label">Power (Watts)</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                className="form-input"
                                placeholder="e.g., 1500"
                                value={device.power}
                                onChange={(e) => updateDevice(index, 'power', e.target.value)}
                              />
                              <span className="input-unit">W</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDevice(index)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {user?.userType === 'community' && (
            <div className="profile-section">
              <div className="section-card">
                <div className="section-header">
                  <div className="section-header-content">
                    <div>
                      <h2 className="section-title">Community Devices</h2>
                      <p className="section-subtitle">
                        Manage community infrastructure devices (streetlights, water pumps, etc.)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCommunityDevice}
                      className="btn btn-outline btn-sm"
                    >
                      Add Community Device
                    </button>
                  </div>
                </div>
                
                <div className="form-content">
                  {communityDevices.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-state-text">No community devices configured</p>
                      <p className="empty-state-subtext">Click "Add Community Device" to get started</p>
                    </div>
                  ) : (
                    <div className="devices-list">
                      {communityDevices.map((device, index) => (
                        <div key={index} className="device-item community-device-item">
                          <div className="device-form-group">
                            <label className="form-label">Device Name</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g., Street Light"
                              value={device.name}
                              onChange={(e) => updateCommunityDevice(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="device-form-group">
                            <label className="form-label">Power per Unit (Watts)</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                className="form-input"
                                placeholder="e.g., 50"
                                value={device.power}
                                onChange={(e) => updateCommunityDevice(index, 'power', e.target.value)}
                              />
                              <span className="input-unit">W</span>
                            </div>
                          </div>
                          <div className="device-form-group">
                            <label className="form-label">Number of Units</label>
                            <input
                              type="number"
                              min="1"
                              className="form-input"
                              placeholder="e.g., 20"
                              value={device.count}
                              onChange={(e) => updateCommunityDevice(index, 'count', e.target.value)}
                            />
                          </div>
                          <div className="device-form-group">
                            <label className="form-label">Daily Operating Hours</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="24"
                                className="form-input"
                                placeholder="e.g., 12"
                                value={device.hoursPerDay}
                                onChange={(e) => updateCommunityDevice(index, 'hoursPerDay', e.target.value)}
                              />
                              <span className="input-unit">hrs/day</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCommunityDevice(index)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Account Information</h2>
              </div>
              <div className="form-content">
                <div className="account-info">
                  <div className="info-row">
                    <span className="info-label">Account Type:</span>
                    <span className="info-value">{user?.userType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Member Since:</span>
                    <span className="info-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile