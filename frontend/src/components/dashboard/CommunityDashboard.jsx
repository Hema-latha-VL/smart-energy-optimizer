import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import CommunityUsageInput from './CommunityUsageInput'
import OptimalTimeRecommendations from './OptimalTimeRecommendations'
import './CommunityDashboard.css'

const CommunityDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/community')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching community dashboard data:', error)
      if (error.response?.status === 400) {
        toast.error('Please complete your community setup first')
        setTimeout(() => navigate('/setup'), 2000)
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Community admin required.')
        setTimeout(() => navigate('/setup'), 2000)
      } else {
        toast.error('Failed to load community dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="community-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="community-dashboard">
        <div className="error-container">
          <p>Unable to load community dashboard. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const { 
    summary = {}, 
    allocationData = [], 
    deviceConsumptionBreakdown = [], 
    villageName = 'Community' 
  } = dashboardData || {}

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {`${data.value} Wh (${((data.value / (summary.dailyEnergyAvailable || 1)) * 100).toFixed(1)}%)`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="community-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Community Energy Dashboard</h1>
        <h2 className="village-name">{villageName}</h2>
        <p className="dashboard-subtitle">Energy allocation and management overview</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-header">
            <h3>Total Energy Available</h3>
            <div className="card-icon">⚡</div>
          </div>
          <div className="card-value">{(summary.dailyEnergyAvailable || 0).toLocaleString()} Wh</div>
        </div>

        <div className="summary-card community">
          <div className="card-header">
            <h3>Community Devices</h3>
            <div className="card-icon">🏭</div>
          </div>
          <div className="card-value">{(summary.communityConsumption || 0).toLocaleString()} Wh</div>
          <div className="card-subtitle">
            {(((summary.communityConsumption || 0) / (summary.dailyEnergyAvailable || 1)) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-header">
            <h3>Per Household</h3>
            <div className="card-icon">🏠</div>
          </div>
          <div className="card-value">{Math.round(summary.perHouseholdAllocation || 0)} Wh</div>
          <div className="card-subtitle">Each of {summary.totalHouseholds || 0} households</div>
        </div>

        <div className="summary-card info">
          <div className="card-header">
            <h3>Energy Surplus</h3>
            <div className="card-icon">🔋</div>
          </div>
          <div className="card-value">{Math.max(0, summary.surplus || 0).toLocaleString()} Wh</div>
          <div className="card-subtitle">
            {((Math.max(0, summary.surplus || 0) / (summary.dailyEnergyAvailable || 1)) * 100).toFixed(1)}% remaining
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Energy Allocation Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Energy Allocation Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Consumption Bar Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Device Consumption (Wh/day)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceConsumptionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalDailyConsumption" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Text */}
      <div className="summary-section">
        <div className="summary-content">
          <div className="summary-box">
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-label">Household Allocation</div>
                <div className="stat-value">{Math.round(summary.perHouseholdAllocation || 0)} Wh per household</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Community Devices Usage</div>
                <div className="stat-value">{(summary.communityConsumption || 0).toLocaleString()} Wh ({(((summary.communityConsumption || 0) / (summary.dailyEnergyAvailable || 1)) * 100).toFixed(1)}%)</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Total Households</div>
                <div className="stat-value">{(summary.totalHouseholdAllocation || 0).toLocaleString()} Wh for {summary.totalHouseholds || 0} homes</div>
              </div>
            </div>
            
            {(summary.surplus || 0) > 0 && (
              <div className="surplus-text">
                <strong>Energy Surplus: {Math.round(summary.surplus || 0).toLocaleString()} Wh available</strong> for storage or emergency use.
              </div>
            )}
            {(summary.surplus || 0) <= 0 && (
              <div className="deficit-text">
                <strong>Energy Deficit Detected.</strong> Consider reducing community device usage or increasing energy generation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Details */}
      <div className="device-details">
        <h3>Community Device Details</h3>
        <div className="device-table">
          <div className="table-header">
            <div>Device Name</div>
            <div>Power (W)</div>
            <div>Hours/Day</div>
            <div>Count</div>
            <div>Daily Consumption (Wh)</div>
          </div>
          {deviceConsumptionBreakdown.map((device, index) => (
            <div key={index} className="table-row">
              <div>{device.name}</div>
              <div>{device.power} W</div>
              <div>{device.hoursPerDay} hrs</div>
              <div>{device.count || 1}</div>
              <div>{device.dailyConsumption} Wh</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Input Section */}
      <div className="usage-input-section">
        <CommunityUsageInput onUsageAdded={fetchCommunityData} />
      </div>

      {/* Optimal Time Recommendations */}
      <div className="recommendations-section">
        <OptimalTimeRecommendations />
      </div>
    </div>
  )
}

export default CommunityDashboard