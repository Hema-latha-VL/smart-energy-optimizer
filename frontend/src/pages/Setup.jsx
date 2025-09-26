import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

// Import external CSS file for this component
import './Setup.css'

const Setup = () => {
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const userType = watch('userType', user?.userType)
  const [devices, setDevices] = useState([])

  useEffect(() => {
    if (user?.userType) {
      setValue('userType', user.userType)
    }
  }, [user, setValue])

  const addDevice = () => {
    if (userType === 'community') {
      setDevices([...devices, { name: '', power: '', count: 1, hoursPerDay: 1 }])
    } else {
      setDevices([...devices, { name: '', power: '' }])
    }
  }

  const removeDevice = (index) => {
    setDevices(devices.filter((_, i) => i !== index))
  }

  const updateDevice = (index, field, value) => {
    const updatedDevices = [...devices]
    updatedDevices[index][field] = value
    setDevices(updatedDevices)
  }

  const onSubmit = async (data) => {
    if (devices.length === 0) {
      toast.error('Please add at least one device')
      return
    }

    setLoading(true)
    try {
      let setupData = { ...data }
      if (userType === 'community') {
        setupData.communityDevices = devices.map((device) => ({
          name: device.name,
          power: parseFloat(device.power),
          count: parseInt(device.count) || 1,
          hoursPerDay: parseFloat(device.hoursPerDay || 1),
        }))
        setupData.villageName = data.villageName
        setupData.totalHouseholds = parseInt(data.totalHouseholds)
        setupData.dailyEnergyAvailable = parseFloat(data.dailyEnergyAvailable)
        setupData.allocationPercentage = parseFloat(data.allocationPercentage || 1)
        // Remove devices field for community
        delete setupData.devices
      } else {
        setupData.devices = devices.map((device) => ({
          name: device.name,
          power: parseFloat(device.power),
        }))
      }

      const response = await api.post('/setup', setupData)

      updateUser({
        ...user,
        setupData: response.data.setupData,
        isSetupComplete: true,
      })

      toast.success('Setup completed successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="text-center mb-8">
          <h1 className="heading">Setup Your Energy System</h1>
          <p className="subheading">
            {userType === 'community' 
              ? 'Configure your village energy management system' 
              : 'Configure your renewable energy resources and devices'
            }
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="setup-form">
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="two-column-grid">
                <label className="radio-option">
                  <input type="radio" value="individual" {...register('userType', {required: 'Please select account type'})} />
                  <div>
                    <div className="option-title">Individual</div>
                    <div className="option-subtitle">Personal energy optimization</div>
                  </div>
                </label>
                <label className="radio-option">
                  <input type="radio" value="community" {...register('userType', {required: 'Please select account type'})} />
                  <div>
                    <div className="option-title">Community Admin</div>
                    <div className="option-subtitle">Village energy management</div>
                  </div>
                </label>
              </div>
              {errors.userType && <p className="form-error">{errors.userType.message}</p>}
            </div>

            {userType === 'community' ? (
              <>
                {/* Community-specific fields */}
                <div className="form-group">
                  <label htmlFor="villageName" className="form-label">Village/Community Name</label>
                  <input 
                    id="villageName" 
                    type="text" 
                    placeholder="Enter village or community name" 
                    className={`form-input ${errors.villageName ? 'error' : ''}`} 
                    {...register('villageName', {required: 'Village name is required'})} 
                  />
                  {errors.villageName && <p className="form-error">{errors.villageName.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="dailyEnergyAvailable" className="form-label">Total Renewable Energy Available Today</label>
                  <div className="input-with-unit">
                    <input 
                      id="dailyEnergyAvailable" 
                      type="number" 
                      step="1" 
                      min="1" 
                      placeholder="Enter daily energy available" 
                      className={`form-input ${errors.dailyEnergyAvailable ? 'error' : ''}`} 
                      {...register('dailyEnergyAvailable', {
                        required: 'Daily energy available is required', 
                        min: {value: 1, message:'Energy must be greater than 0'}
                      })} 
                    />
                    <span className="input-unit">Wh</span>
                  </div>
                  {errors.dailyEnergyAvailable && <p className="form-error">{errors.dailyEnergyAvailable.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="totalHouseholds" className="form-label">Total Number of Households</label>
                  <input 
                    id="totalHouseholds" 
                    type="number" 
                    min="1" 
                    placeholder="Enter total households" 
                    className={`form-input ${errors.totalHouseholds ? 'error' : ''}`} 
                    {...register('totalHouseholds', {
                      required: 'Total households is required', 
                      min: {value: 1, message:'Must have at least 1 household'}
                    })} 
                  />
                  {errors.totalHouseholds && <p className="form-error">{errors.totalHouseholds.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="allocationPercentage" className="form-label">Allocation Percentage per Household</label>
                  <div className="input-with-unit">
                    <input 
                      id="allocationPercentage" 
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      max="10" 
                      defaultValue="1"
                      placeholder="1" 
                      className={`form-input ${errors.allocationPercentage ? 'error' : ''}`} 
                      {...register('allocationPercentage', {
                        min: {value: 0.1, message:'Minimum 0.1%'},
                        max: {value: 10, message:'Maximum 10%'}
                      })} 
                    />
                    <span className="input-unit">%</span>
                  </div>
                  <p className="helper-text">Percentage of remaining energy allocated per household (default: 1%)</p>
                  {errors.allocationPercentage && <p className="form-error">{errors.allocationPercentage.message}</p>}
                </div>

                <div className="form-group">
                  <div className="devices-header">
                    <label className="form-label">Community Devices</label>
                    <button type="button" onClick={addDevice} className="btn btn-outline btn-sm">Add Community Device</button>
                  </div>
                  <p className="helper-text">Add devices like streetlights, water pumps, irrigation pumps, etc.</p>

                  {devices.length === 0 ? (
                    <div className="empty-devices-text">No community devices added yet <br/> Click "Add Community Device" to get started</div>
                  ) : (
                    <div className="devices-list">
                      {devices.map((device, index) => (
                        <div key={index} className="community-device-row">
                          <input 
                            type="text" 
                            placeholder="Device name (e.g., Street Light)" 
                            className="form-input device-name-input" 
                            value={device.name} 
                            onChange={(e) => updateDevice(index, 'name', e.target.value)} 
                          />
                          <div className="device-count-input-wrapper">
                            <input 
                              type="number" 
                              step="1" 
                              min="1" 
                              className="form-input count-input" 
                              placeholder="Count" 
                              value={device.count || 1} 
                              onChange={(e) => updateDevice(index, 'count', e.target.value)} 
                            />
                            <span className="input-unit"><b>units</b></span>
                          </div>
                          <div className="device-power-input-wrapper">
                            <input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              className="form-input power-input" 
                              placeholder="Power/unit" 
                              value={device.power} 
                              onChange={(e) => updateDevice(index, 'power', e.target.value)} 
                            />
                            <span className="input-unit"><b>W</b></span>
                          </div>
                          <div className="device-hours-input-wrapper">
                            <input 
                              type="number" 
                              step="0.1" 
                              min="0.1" 
                              max="24"
                              className="form-input hours-input" 
                              placeholder="Hours/day" 
                              value={device.hoursPerDay || 1} 
                              onChange={(e) => updateDevice(index, 'hoursPerDay', e.target.value)} 
                            />
                            <span className="input-unit"><b>hrs/day</b></span>
                          </div>
                          <button type="button" onClick={() => removeDevice(index)} className="btn btn-danger btn-sm remove-btn">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Individual user fields */}
                <div className="form-group">
                  <label htmlFor="renewableResource" className="form-label">Renewable Energy Resource</label>
                  <select id="renewableResource" className={`form-select ${errors.renewableResource ? 'error' : ''}`} {...register('renewableResource', {required:'Please select a renewable resource'})}>
                    <option value="">Select resource type</option>
                    <option value="solar">Solar Panels</option>
                    <option value="wind">Wind Turbine</option>
                  </select>
                  {errors.renewableResource && <p className="form-error">{errors.renewableResource.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="totalCapacity" className="form-label">Total Installed Capacity</label>
                  <div className="input-with-unit">
                    <input id="totalCapacity" type="number" step="0.1" min="0" placeholder="Enter capacity" className={`form-input ${errors.totalCapacity ? 'error' : ''}`} {...register('totalCapacity', {required: 'Capacity is required', min: {value: 0.1, message:'Capacity must be greater than 0'}})} />
                    <span className="input-unit">kWh</span>
                  </div>
                  {errors.totalCapacity && <p className="form-error">{errors.totalCapacity.message}</p>}
                </div>

                <div className="form-group">
                  <div className="devices-header">
                    <label className="form-label">Household Devices</label>
                    <button type="button" onClick={addDevice} className="btn btn-outline btn-sm">Add Device</button>
                  </div>

                  {devices.length === 0 ? (
                    <div className="empty-devices-text">No devices added yet <br/> Click "Add Device" to get started</div>
                  ) : (
                    <div className="devices-list">
                      {devices.map((device, index) => (
                        <div key={index} className="device-row">
                          <input type="text" placeholder="Device name" className="form-input device-name-input" value={device.name} onChange={(e) => updateDevice(index, 'name', e.target.value)} />
                          <div className="device-power-input-wrapper">
                            <input type="number" step="0.1" min="0" className="form-input power-input" placeholder="Power" value={device.power} onChange={(e) => updateDevice(index, 'power', e.target.value)} />
                            <span className="input-unit"><b>W</b></span>
                          </div>
                          <button type="button" onClick={() => removeDevice(index)} className="btn btn-danger btn-sm remove-btn">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Location (Optional)</label>
              <div className="two-column-grid">
                <input type="number" step="0.000001" placeholder="Latitude" className="form-input" {...register('location.latitude')} />
                <input type="number" step="0.000001" placeholder="Longitude" className="form-input" {...register('location.longitude')} />
              </div>
              <p className="helper-text">Location helps provide accurate weather-based predictions</p>
            </div>

            <div className="form-buttons" style={{ display: 'flex', flexWrap: 'nowrap', gap: '1rem', width: '100%', maxWidth: 'none' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                Skip for now
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || devices.length === 0}>
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Setup
