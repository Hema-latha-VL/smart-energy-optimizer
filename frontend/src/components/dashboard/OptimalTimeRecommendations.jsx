import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../../services/api'

const OptimalTimeRecommendations = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      // Mock data for optimal times - in real app, this would come from ML service
      const mockRecommendations = [
        { hour: '06:00', solarGeneration: 100, recommended: 'Low Priority', color: '#fbbf24' },
        { hour: '07:00', solarGeneration: 300, recommended: 'Medium', color: '#60a5fa' },
        { hour: '08:00', solarGeneration: 500, recommended: 'High', color: '#34d399' },
        { hour: '09:00', solarGeneration: 700, recommended: 'High', color: '#34d399' },
        { hour: '10:00', solarGeneration: 900, recommended: 'Optimal', color: '#10b981' },
        { hour: '11:00', solarGeneration: 1000, recommended: 'Optimal', color: '#10b981' },
        { hour: '12:00', solarGeneration: 1100, recommended: 'Optimal', color: '#10b981' },
        { hour: '13:00', solarGeneration: 1000, recommended: 'Optimal', color: '#10b981' },
        { hour: '14:00', solarGeneration: 900, recommended: 'High', color: '#34d399' },
        { hour: '15:00', solarGeneration: 700, recommended: 'High', color: '#34d399' },
        { hour: '16:00', solarGeneration: 500, recommended: 'Medium', color: '#60a5fa' },
        { hour: '17:00', solarGeneration: 300, recommended: 'Low Priority', color: '#fbbf24' },
        { hour: '18:00', solarGeneration: 100, recommended: 'Not Recommended', color: '#f87171' },
        { hour: '19:00', solarGeneration: 0, recommended: 'Not Recommended', color: '#ef4444' },
        { hour: '20:00', solarGeneration: 0, recommended: 'Not Recommended', color: '#ef4444' },
        { hour: '21:00', solarGeneration: 0, recommended: 'Not Recommended', color: '#ef4444' },
      ]
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            Generation: {data.solarGeneration} Wh
          </p>
          <p className="tooltip-recommendation" style={{ color: data.color }}>
            {data.recommended}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="optimal-times-loading">
        <p>Loading optimal time recommendations...</p>
      </div>
    )
  }

  const optimalHours = recommendations.filter(r => r.recommended === 'Optimal')
  const highPriorityHours = recommendations.filter(r => r.recommended === 'High')

  return (
    <div className="optimal-times-container">
      <div className="optimal-times-header">
        <h3 className="section-title">⏰ Best Time Recommendations for Community Devices</h3>
        <p className="section-subtitle">Based on solar energy generation forecast</p>
      </div>

      {/* Quick Recommendations */}
      <div className="quick-recommendations">
        <div className="recommendation-card optimal">
          <div className="recommendation-icon">🌟</div>
          <div className="recommendation-content">
            <h4>Optimal Times</h4>
            <p>{optimalHours.map(h => h.hour.substring(0, 5)).join(', ')}</p>
            <span className="recommendation-note">Best for high-power devices</span>
          </div>
        </div>

        <div className="recommendation-card high">
          <div className="recommendation-icon">⚡</div>
          <div className="recommendation-content">
            <h4>High Priority Times</h4>
            <p>{highPriorityHours.map(h => h.hour.substring(0, 5)).join(', ')}</p>
            <span className="recommendation-note">Good for medium-power devices</span>
          </div>
        </div>

        <div className="recommendation-card avoid">
          <div className="recommendation-icon">🌙</div>
          <div className="recommendation-content">
            <h4>Avoid These Times</h4>
            <p>19:00 - 05:00</p>
            <span className="recommendation-note">No solar generation</span>
          </div>
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="chart-container">
        <h4 className="chart-title">Hourly Energy Generation & Recommendations</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={recommendations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis label={{ value: 'Generation (Wh)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="solarGeneration" 
              fill={(entry) => entry.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Device-Specific Recommendations */}
      <div className="device-recommendations">
        <h4 className="subsection-title">💡 Device-Specific Recommendations</h4>
        <div className="device-rec-grid">
          <div className="device-rec-card">
            <h5>🏮 Street Lights</h5>
            <p><strong>Avoid:</strong> 19:00-06:00 (No solar)</p>
            <p><strong>Best:</strong> Use motion sensors or timer controls</p>
          </div>
          
          <div className="device-rec-card">
            <h5>💧 Water Pumps</h5>
            <p><strong>Optimal:</strong> 10:00-14:00</p>
            <p><strong>High Priority:</strong> 08:00-16:00</p>
          </div>
          
          <div className="device-rec-card">
            <h5>🌾 Irrigation Pumps</h5>
            <p><strong>Optimal:</strong> 11:00-13:00</p>
            <p><strong>Good:</strong> 09:00-15:00</p>
          </div>
          
          <div className="device-rec-card">
            <h5>🏛️ Community Hall</h5>
            <p><strong>Best:</strong> 10:00-16:00 for events</p>
            <p><strong>Lighting:</strong> Use during peak solar hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimalTimeRecommendations