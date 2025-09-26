import { format } from 'date-fns'

const EnergyCards = ({ summary }) => {
  const cards = [
    {
      title: 'Generated Today',
      value: `${summary.generatedToday}`,
      unit: 'kWh',
      icon: '⚡',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)'
    },
    {
      title: 'Consumed Today',
      value: `${summary.consumedToday}`,
      unit: 'kWh',
      icon: '🔌',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      title: summary.isDeficit ? 'Deficit' : 'Surplus',
      value: `${Math.abs(summary.surplus)}`,
      unit: 'kWh',
      icon: summary.isDeficit ? '⚠️' : '✅',
      color: summary.isDeficit ? '#ef4444' : '#10b981',
      bgColor: summary.isDeficit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      borderColor: summary.isDeficit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
    },
    {
      title: 'Efficiency',
      value: `${summary.efficiency}`,
      unit: '%',
      icon: '📊',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.2)'
    }
  ]

  return (
    <div className="energy-cards-container">
      {cards.map((card, index) => (
        <div
          key={index}
          className="energy-card"
          style={{
            backgroundColor: card.bgColor,
            borderColor: card.borderColor,
          }}
        >
          <div className="energy-card-content">
            <div className="energy-card-header">
              <div className="energy-card-icon" style={{ backgroundColor: card.color }}>
                <span>{card.icon}</span>
              </div>
              <div className="energy-card-title">
                {card.title}
              </div>
            </div>
            <div className="energy-card-value">
              <span className="energy-value" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="energy-unit" style={{ color: card.color }}>
                {card.unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EnergyCards
