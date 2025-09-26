import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const UsageInput = ({ devices, onUsageAdded }) => {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const selectedDevice = devices.find(d => d.name === data.device)
      
      await api.post('/usage', {
        device: {
          name: data.device,
          power: selectedDevice.power
        },
        startTime: new Date(data.startTime).toISOString(),
        duration: parseFloat(data.duration),
        notes: data.notes || ''
      })

      reset()
      onUsageAdded()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log usage')
    } finally {
      setLoading(false)
    }
  }

  if (devices.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Log Device Usage</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No devices configured</p>
          <p className="text-sm">Add devices in your profile to start logging usage</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card usage-input-card">
      <div className="card-header">
        <h2 className="card-title">Log Device Usage</h2>
        <p className="card-subtitle">
          Record device usage
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="form-group compact">
          <label htmlFor="device" className="form-label compact">
            Device
          </label>
          <select
            id="device"
            className={`form-select compact ${errors.device ? 'error' : ''}`}
            {...register('device', { required: 'Please select a device' })}
          >
            <option value="">Select a device</option>
            {devices.map((device, index) => (
              <option key={index} value={device.name}>
                {device.name} ({device.power}W)
              </option>
            ))}
          </select>
          {errors.device && (
            <p className="form-error compact">{errors.device.message}</p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group compact flex-1">
            <label htmlFor="startTime" className="form-label compact">
              Start Time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              className={`form-input compact ${errors.startTime ? 'error' : ''}`}
              {...register('startTime', { required: 'Start time is required' })}
            />
            {errors.startTime && (
              <p className="form-error compact">{errors.startTime.message}</p>
            )}
          </div>

          <div className="form-group compact flex-1">
            <label htmlFor="duration" className="form-label compact">
              Duration (hrs)
            </label>
            <input
              id="duration"
              type="number"
              step="0.1"
              min="0.1"
              className={`form-input compact ${errors.duration ? 'error' : ''}`}
              placeholder="e.g., 2.5"
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 0.1, message: 'Duration must be at least 0.1 hours' }
              })}
            />
            {errors.duration && (
              <p className="form-error compact">{errors.duration.message}</p>
            )}
          </div>
        </div>

        <div className="form-group compact">
          <label htmlFor="notes" className="form-label compact">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={2}
            className="form-input compact"
            placeholder="Add any notes..."
            {...register('notes')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full compact"
        >
          {loading ? (
            <>
              <div className="spinner w-4 h-4"></div>
              Logging...
            </>
          ) : (
            'Log Usage'
          )}
        </button>
      </form>
    </div>
  )
}

export default UsageInput
