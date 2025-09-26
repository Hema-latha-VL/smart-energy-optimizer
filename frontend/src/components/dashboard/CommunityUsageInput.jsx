import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const CommunityUsageInput = ({ onUsageAdded }) => {
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [fetchingDevices, setFetchingDevices] = useState(true)
  const [calculatedConsumption, setCalculatedConsumption] = useState(0)
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm()

  // Watch form values for real-time calculation
  const watchedDevice = watch('device')
  const watchedHours = watch('hours')
  const watchedUnitsUsed = watch('unitsUsed')

  useEffect(() => {
    fetchCommunityDevices()
  }, [])

  useEffect(() => {
    // Calculate energy consumption in real-time
    if (watchedDevice && watchedHours && watchedUnitsUsed) {
      const selectedDevice = devices.find(d => d.name === watchedDevice)
      if (selectedDevice) {
        const consumption = selectedDevice.power * parseFloat(watchedHours) * parseInt(watchedUnitsUsed)
        setCalculatedConsumption(consumption)
      }
    } else {
      setCalculatedConsumption(0)
    }
  }, [watchedDevice, watchedHours, watchedUnitsUsed, devices])

  const fetchCommunityDevices = async () => {
    try {
      const response = await api.get('/setup')
      console.log('Setup response:', response.data)
      if (response.data.setupData && response.data.setupData.communityDevices) {
        console.log('Community devices found:', response.data.setupData.communityDevices)
        setDevices(response.data.setupData.communityDevices)
      } else {
        console.log('No community devices in setup data:', response.data.setupData)
      }
    } catch (error) {
      console.error('Error fetching community devices:', error)
      toast.error('Failed to load community devices')
    } finally {
      setFetchingDevices(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const selectedDevice = devices.find(d => d.name === data.device)
      const totalConsumption = selectedDevice.power * parseFloat(data.hours) * parseInt(data.unitsUsed)
      
      const usageData = {
        device: {
          name: data.device,
          power: selectedDevice.power,
          totalPower: selectedDevice.power * parseInt(data.unitsUsed)
        },
        date: data.date,
        hours: parseFloat(data.hours),
        unitsUsed: parseInt(data.unitsUsed),
        totalConsumption: totalConsumption,
        notes: data.notes || '',
        isOptimized: data.isOptimized || false,
        timestamp: new Date().toISOString()
      }

      await api.post('/usage/community', usageData)

      reset()
      setCalculatedConsumption(0)
      if (onUsageAdded) {
        onUsageAdded()
      }
      toast.success(`✅ Usage logged! Total consumption: ${totalConsumption.toLocaleString()} Wh`)
    } catch (error) {
      console.error('Error logging usage:', error)
      toast.error(error.response?.data?.message || 'Failed to log usage')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingDevices) {
    return (
      <div className="usage-form-container">
        <div className="form-header">
          <h3 className="form-title">📝 Log Community Device Usage</h3>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading community devices...</p>
        </div>
      </div>
    )
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="usage-form-container">
        <div className="form-header">
          <h3 className="form-title">📝 Log Community Device Usage</h3>
        </div>
        <div className="empty-state">
          <p>🏭 No community devices configured</p>
          <p className="help-text">Add devices in your community setup to start logging usage</p>
        </div>
      </div>
    )
  }

  const selectedDevice = devices.find(d => d.name === watchedDevice)

  return (
    <div className="usage-form-container">
      <div className="form-header">
        <h3 className="form-title">📝 Log Community Device Usage</h3>
        <p className="form-subtitle">
          Record device usage and calculate energy consumption automatically
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="usage-form">
        <div className="form-grid">
          {/* Device Selection */}
          <div className="form-group">
            <label htmlFor="device" className="form-label">
              Community Device
            </label>
            <select
              id="device"
              className={`form-input ${errors.device ? 'error' : ''}`}
              {...register('device', { required: 'Please select a device' })}
            >
              <option value="">Choose a device...</option>
              {devices.map((device, index) => (
                <option key={index} value={device.name}>
                  {device.name} ({device.power}W per unit - {device.count || 1} total units)
                </option>
              ))}
            </select>
            {errors.device && (
              <span className="form-error">{errors.device.message}</span>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Usage Date
            </label>
            <input
              id="date"
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              defaultValue={new Date().toISOString().split('T')[0]}
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <span className="form-error">{errors.date.message}</span>
            )}
          </div>

          {/* Hours */}
          <div className="form-group">
            <label htmlFor="hours" className="form-label">
              Hours of Operation
            </label>
            <input
              id="hours"
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              className={`form-input ${errors.hours ? 'error' : ''}`}
              placeholder="e.g., 8.5"
              {...register('hours', {
                required: 'Hours is required',
                min: { value: 0.1, message: 'Minimum 0.1 hours' },
                max: { value: 24, message: 'Maximum 24 hours per day' }
              })}
            />
            {errors.hours && (
              <span className="form-error">{errors.hours.message}</span>
            )}
          </div>

          {/* Units Used */}
          <div className="form-group">
            <label htmlFor="unitsUsed" className="form-label">
              Units Actually Used
            </label>
            <input
              id="unitsUsed"
              type="number"
              min="1"
              className={`form-input ${errors.unitsUsed ? 'error' : ''}`}
              placeholder="How many units?"
              {...register('unitsUsed', {
                required: 'Number of units is required',
                min: { value: 1, message: 'At least 1 unit required' },
                max: selectedDevice ? { 
                  value: selectedDevice.count || 1, 
                  message: `Maximum ${selectedDevice.count || 1} units available` 
                } : undefined
              })}
            />
            {errors.unitsUsed && (
              <span className="form-error">{errors.unitsUsed.message}</span>
            )}
            {selectedDevice && (
              <span className="form-help">
                Available: {selectedDevice.count || 1} units
              </span>
            )}
          </div>
        </div>

        {/* Energy Calculation Display */}
        {calculatedConsumption > 0 && (
          <div className="calculation-display">
            <h4 className="calculation-title">⚡ Energy Consumption Calculation</h4>
            <div className="calculation-grid">
              <div className="calc-item">
                <span className="calc-label">Power per unit:</span>
                <span className="calc-value">{selectedDevice?.power || 0}W</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Units used:</span>
                <span className="calc-value">{watchedUnitsUsed || 0}</span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Hours operated:</span>
                <span className="calc-value">{watchedHours || 0}h</span>
              </div>
              <div className="calc-item calc-total">
                <span className="calc-label">Total Energy:</span>
                <span className="calc-value">{calculatedConsumption.toLocaleString()} Wh</span>
              </div>
            </div>
            <div className="calculation-formula">
              Formula: {selectedDevice?.power || 0}W × {watchedUnitsUsed || 0} units × {watchedHours || 0}h = {calculatedConsumption.toLocaleString()} Wh
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-group full-width">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            placeholder="Add notes about this usage (maintenance, special conditions, etc.)"
            {...register('notes')}
          />
        </div>

        {/* Optimization Checkbox */}
        <div className="checkbox-group">
          <input
            id="isOptimized"
            type="checkbox"
            className="checkbox-input"
            {...register('isOptimized')}
          />
          <label htmlFor="isOptimized" className="checkbox-label">
            ✅ This usage was during optimal solar hours (10:00 AM - 2:00 PM)
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Logging Usage...
            </>
          ) : (
            '📊 Log Device Usage'
          )}
        </button>
      </form>
    </div>
  )
}

export default CommunityUsageInput