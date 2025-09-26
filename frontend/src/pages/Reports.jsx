import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import './Reports.css'

const Reports = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [summary, setSummary] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchReportsData()
  }, [dateRange])

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/summary', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      })
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching reports data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await api.get('/reports/export', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format: 'csv'
        },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `energy_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const handleExportMonthly = async () => {
    setExporting(true)
    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1

      const response = await api.get('/reports/monthly', {
        params: { year, month },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `monthly_report_${year}_${month}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Monthly report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export monthly report')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading reports..." />
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        {/* Header */}
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">View and export your energy usage data</p>
        </div>

        {/* Date Range and Summary Section */}
        <div className="reports-main-section">
          {/* Left Side - Date Range */}
          <div className="date-range-section">
            <div className="date-range-card">
              <h3 className="section-title">Date Range</h3>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label className="date-label">Start Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="date-input-group">
                  <label className="date-label">End Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Summary Cards */}
          <div className="summary-section">
            {summary && (
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-number">{summary.summary.totalRecords}</div>
                  <div className="summary-label">Tot Rec</div>
                </div>
                <div className="summary-card">
                  <div className="summary-number">{Math.round(summary.summary.totalEnergyUsed / 1000 * 100) / 100}</div>
                  <div className="summary-label">Tot Ene (kV)</div>
                </div>
                <div className="summary-card">
                  <div className="summary-number">{summary.summary.totalDuration.toFixed(1)}</div>
                  <div className="summary-label">Tot Ho</div>
                </div>
                <div className="summary-card">
                  <div className="summary-number">{Math.round(summary.summary.averageEnergyPerDay / 1000 * 100) / 100}</div>
                  <div className="summary-label">Avg Dai (kV)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Usage Section */}
        {summary?.recentUsage && (
          <div className="recent-usage-section">
            <h3 className="section-title">Recent Usage</h3>
            <div className="recent-usage-list">
              {summary.recentUsage.map((usage, index) => (
                <div key={index} className="usage-item">
                  <div className="usage-date">
                    {format(new Date(usage.startTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="usage-device">
                    {usage.device.name} {usage.device.power}W
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CSV Export Section */}
        <div className="csv-export-section">
          <h3 className="section-title">CSV format</h3>
          <div className="export-buttons">
            <button 
              onClick={handleExportCSV} 
              disabled={exporting} 
              className="export-btn export-btn-primary"
            >
              {exporting ? (
                <>
                  <div className="spinner"></div> Exporting...
                </>
              ) : (
                <>
                  📊 Export Custom Range
                </>
              )}
            </button>
            <button 
              onClick={handleExportMonthly} 
              disabled={exporting} 
              className="export-btn export-btn-secondary"
            >
              {exporting ? (
                <>
                  <div className="spinner"></div> Exporting...
                </>
              ) : (
                <>
                  📅 Export This Month
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports