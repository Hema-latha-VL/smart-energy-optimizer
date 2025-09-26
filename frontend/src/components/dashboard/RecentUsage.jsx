import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

const RecentUsage = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([date, stats]) => ({
      date: format(parseISO(date), 'MMM dd'),
      energyUsed: Math.round(stats.energyUsed / 1000 * 100) / 100, // Convert to kWh
      cost: stats.cost,
      deviceCount: stats.deviceCount
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Energy Used: {data.energyUsed} kWh
          </p>
          <p className="text-gray-600">
            Devices: {data.deviceCount}
          </p>
          {data.cost > 0 && (
            <p className="text-gray-600">
              Cost: ${data.cost.toFixed(2)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>No usage data available</p>
          <p className="text-sm">Start logging device usage to see trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="energyUsed" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RecentUsage
