import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import EnergyCards from '../components/dashboard/EnergyCards'
import PredictionChart from '../components/dashboard/PredictionChart'
import RecommendedWindows from '../components/dashboard/RecommendedWindows'
import UsageInput from '../components/dashboard/UsageInput'
import RecentUsage from '../components/dashboard/RecentUsage'
import CommunityDashboard from '../components/dashboard/CommunityDashboard'
import DeviceUsagePieChart from '../components/dashboard/DeviceUsagePieChart'
import LoadingSpinner from '../components/LoadingSpinner'
import './Dashboard.css'  // Import external CSS

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [recentUsage, setRecentUsage] = useState(null)
  const [deviceUsageData, setDeviceUsageData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [summaryRes, predictionsRes, recentUsageRes, deviceUsageRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/predictions'),
        api.get('/dashboard/recent-usage?days=7'),
        api.get('/dashboard/device-usage-breakdown?days=30').catch(() => ({ data: [] }))
      ])

      setSummary(summaryRes.data)
      setPredictions(predictionsRes.data)
      setRecentUsage(recentUsageRes.data)
      
      // Process device usage data for pie chart
      if (deviceUsageRes.data && deviceUsageRes.data.length > 0) {
        const totalUsage = deviceUsageRes.data.reduce((sum, item) => sum + item.totalEnergyUsed, 0)
        const pieData = deviceUsageRes.data.map(item => ({
          name: item.deviceName,
          value: Math.round(item.totalEnergyUsed),
          percentage: Math.round((item.totalEnergyUsed / totalUsage) * 100)
        }))
        setDeviceUsageData(pieData)
      } else {
        setDeviceUsageData([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleUsageAdded = () => {
    fetchDashboardData()
    toast.success('Usage logged successfully!')
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  // Render Community Dashboard for community users
  if (user?.userType === 'community') {
    return <CommunityDashboard />
  }

  // Render Individual Dashboard for individual users
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container">
        <div>
          {/* Header */}
          <div className="section-spacing">
            <h1 className="text-large font-bold text-dark mb-4">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-medium text-muted">
              Here's your energy overview for today
            </p>
          </div>

          {/* Energy Summary Cards */}
          {summary && <EnergyCards summary={summary} />}

          {/* Main Grid */}
          <div className="grid lg-grid-cols-3 gap-6">
            {/* Left Col */}
            <div className="lg-col-span-2 space-y-6">
              {/* Charts Grid - Side by Side */}
              <div className="charts-grid">
                {/* Energy Generation Prediction Chart */}
                {predictions && (
                  <div className="card chart-card">
                    <div className="card-header compact">
                      <h2 className="card-title">Energy Generation Forecast</h2>
                      <p className="card-subtitle">{predictions.weatherSummary}</p>
                    </div>
                    <div className="chart-container">
                      <PredictionChart data={predictions.hourlyData} />
                    </div>
                  </div>
                )}

                {/* Device Usage Distribution Pie Chart */}
                <div className="card chart-card">
                  <div className="card-header compact">
                    <h2 className="card-title">Device Usage Breakdown</h2>
                    <p className="card-subtitle">Energy consumption by device (Last 30 days)</p>
                  </div>
                  <div className="chart-container">
                    <DeviceUsagePieChart data={deviceUsageData} />
                  </div>
                </div>
              </div>

              {/* Usage Trend Chart - Full Width */}
              {recentUsage && (
                <div className="card usage-trend-card">
                  <div className="card-header">
                    <h2 className="card-title">Usage Trend</h2>
                    <p className="card-subtitle">Last 7 days energy consumption pattern</p>
                  </div>
                  <RecentUsage data={recentUsage.dailyUsage} />
                </div>
              )}

              {/* Recommended Usage Windows */}
              {predictions?.recommendedWindows && (
                <RecommendedWindows windows={predictions.recommendedWindows} />
              )}
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              {/* Usage Input */}
              <UsageInput
                devices={user?.setupData?.devices || []}
                onUsageAdded={handleUsageAdded}
              />

              {/* Energy Overview Stats */}
              <div className="card stats-card">
                <div className="card-header">
                  <h2 className="card-title">System Overview</h2>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">
                      {user?.setupData?.totalCapacity || 0} <span className="stat-unit">kWh</span>
                    </div>
                    <div className="stat-label">Total Capacity</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value capitalize">
                      {user?.setupData?.renewableResource || 'N/A'}
                    </div>
                    <div className="stat-label">Energy Source</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {user?.setupData?.devices?.length || 0}
                    </div>
                    <div className="stat-label">Configured Devices</div>
                  </div>
                  {predictions && (
                    <div className="stat-item">
                      <div className="stat-value">
                        {(predictions.averageEfficiency * 100).toFixed(1)} <span className="stat-unit">%</span>
                      </div>
                      <div className="stat-label">Avg Efficiency</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather Summary - Compact */}
              {predictions && (
                <div className="card weather-card compact">
                  <div className="card-header">
                    <h2 className="card-title">Weather Forecast</h2>
                  </div>
                  <div className="weather-list compact">
                    {predictions.hourlyData.slice(0, 4).map((hour, index) => (
                      <div key={index} className="weather-item compact">
                        <span className="weather-time">{hour.hour}:00</span>
                        <div className="weather-details">
                          <span className="weather-condition capitalize">{hour.weatherCondition}</span>
                          <span className="weather-temp">{hour.temperature.toFixed(0)}°C</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
