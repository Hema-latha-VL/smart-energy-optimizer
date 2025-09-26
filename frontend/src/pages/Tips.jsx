import { useState } from 'react'
import './Tips.css'

const Tips = () => {
  const [activeCategory, setActiveCategory] = useState('all')

  const tips = {
    lighting: [
      {
        title: "Switch to LED Bulbs",
        description: "LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer.",
        impact: "Save up to $75 per year per bulb",
        icon: "💡"
      },
      {
        title: "Use Natural Light",
        description: "Open curtains and blinds during the day to reduce artificial lighting needs.",
        impact: "Reduce lighting costs by 20-30%",
        icon: "☀️"
      },
      {
        title: "Install Motion Sensors",
        description: "Automatically turn off lights when rooms are unoccupied.",
        impact: "Save 15-20% on lighting bills",
        icon: "🔍"
      },
      {
        title: "Use Task Lighting",
        description: "Use focused lighting for specific tasks instead of lighting entire rooms.",
        impact: "Reduce energy consumption by 40%",
        icon: "🎯"
      }
    ],
    heating: [
      {
        title: "Program Your Thermostat",
        description: "Set your thermostat 7-10°F lower when sleeping or away from home.",
        impact: "Save 10% annually on heating costs",
        icon: "🌡️"
      },
      {
        title: "Seal Air Leaks",
        description: "Caulk and weatherstrip around windows and doors to prevent heat loss.",
        impact: "Reduce heating costs by 10-20%",
        icon: "🔒"
      },
      {
        title: "Use Ceiling Fans",
        description: "Run ceiling fans clockwise in winter to push warm air down.",
        impact: "Feel 4°F warmer, reduce heating needs",
        icon: "🌀"
      },
      {
        title: "Insulate Your Home",
        description: "Proper insulation in walls, attic, and basement reduces energy loss.",
        impact: "Save 15-20% on heating and cooling",
        icon: "🏠"
      }
    ],
    appliances: [
      {
        title: "Unplug Electronics",
        description: "Unplug chargers and electronics when not in use to eliminate phantom loads.",
        impact: "Save $100-200 annually",
        icon: "🔌"
      },
      {
        title: "Use Energy Star Appliances",
        description: "Energy Star appliances use 10-50% less energy than standard models.",
        impact: "Save $100-500 per year",
        icon: "⭐"
      },
      {
        title: "Run Full Loads",
        description: "Only run dishwashers and washing machines with full loads.",
        impact: "Reduce water and energy use by 25%",
        icon: "🧺"
      },
      {
        title: "Clean Refrigerator Coils",
        description: "Clean condenser coils twice yearly for optimal efficiency.",
        impact: "Improve efficiency by 30%",
        icon: "🧽"
      }
    ],
    cooling: [
      {
        title: "Use Window Coverings",
        description: "Close blinds and curtains during hot days to block solar heat.",
        impact: "Reduce cooling costs by 20%",
        icon: "🪟"
      },
      {
        title: "Maintain Your AC",
        description: "Clean or replace air filters monthly and schedule annual maintenance.",
        impact: "Improve efficiency by 15%",
        icon: "❄️"
      },
      {
        title: "Use Fans First",
        description: "Use ceiling fans before turning on air conditioning.",
        impact: "Feel 4°F cooler, reduce AC use",
        icon: "🌪️"
      },
      {
        title: "Plant Shade Trees",
        description: "Plant trees on the south and west sides of your home for natural cooling.",
        impact: "Reduce cooling costs by 25%",
        icon: "🌳"
      }
    ],
    water: [
      {
        title: "Fix Leaky Faucets",
        description: "A single leaky faucet can waste 3,000 gallons of water per year.",
        impact: "Save $50-100 annually",
        icon: "🚰"
      },
      {
        title: "Install Low-Flow Fixtures",
        description: "Low-flow showerheads and faucets reduce water usage by 30-50%.",
        impact: "Save 20-30% on water bills",
        icon: "💧"
      },
      {
        title: "Use Cold Water",
        description: "Wash clothes in cold water to save energy on water heating.",
        impact: "Save $60-100 per year",
        icon: "🧊"
      },
      {
        title: "Take Shorter Showers",
        description: "Reduce shower time by 2 minutes to save water and energy.",
        impact: "Save 1,750 gallons annually",
        icon: "⏱️"
      }
    ]
  }

  const categories = [
    { id: 'all', name: 'All Tips', icon: '🌟' },
    { id: 'lighting', name: 'Lighting', icon: '💡' },
    { id: 'heating', name: 'Heating', icon: '🌡️' },
    { id: 'cooling', name: 'Cooling', icon: '❄️' },
    { id: 'appliances', name: 'Appliances', icon: '🔌' },
    { id: 'water', name: 'Water', icon: '💧' }
  ]

  const getFilteredTips = () => {
    if (activeCategory === 'all') {
      return Object.values(tips).flat()
    }
    return tips[activeCategory] || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container">
        <div className="content-wrapper">
          {/* Header */}
          <header className="tips-header text-center">
            <h1 className="title">Energy Saving Tips</h1>
            <p className="subtitle">
              Discover practical ways to reduce your energy consumption and save money while helping the environment.
            </p>
          </header>

          {/* Category Filter */}
          <nav className="category-filter" aria-label="Filter tips by category">
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  aria-pressed={activeCategory === category.id}
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Tips Grid */}
          <section className="tips-grid">
            {getFilteredTips().map((tip, index) => (
              <article key={index} className="tip-card" tabIndex={0} aria-label={tip.title}>
                <div className="tip-icon">{tip.icon}</div>
                <div className="tip-content">
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className="tip-description">{tip.description}</p>
                  <div className="tip-impact">
                    <p>💰 {tip.impact}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Additional Resources CTA */}
          <section className="resources-cta">
            <div className="resources-cta-content">
              <h2 className="resources-title">Ready to Start Saving?</h2>
              <p className="resources-subtitle">
                Track your energy usage and see the impact of these tips in real-time.
              </p>
              <div className="resources-buttons">
                <button className="btn-primary">View Dashboard</button>
                <button className="btn-secondary">Download Tips PDF</button>
              </div>
            </div>
          </section>

          {/* Energy Savings Calculator */}
          <section className="savings-calculator">
            <h2 className="calculator-title">Calculate Your Potential Savings</h2>
            <div className="calculator-grid">
              <div className="calculator-item">
                <div className="calculator-icon blue-bg">💰</div>
                <h3>Monthly Savings</h3>
                <p className="highlight blue-text">$50-150</p>
                <p className="small-text">With basic tips</p>
              </div>
              <div className="calculator-item">
                <div className="calculator-icon green-bg">🌱</div>
                <h3>CO₂ Reduction</h3>
                <p className="highlight green-text">1-3 tons</p>
                <p className="small-text">Per year</p>
              </div>
              <div className="calculator-item">
                <div className="calculator-icon purple-bg">⚡</div>
                <h3>Energy Reduction</h3>
                <p className="highlight purple-text">20-40%</p>
                <p className="small-text">Overall usage</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Tips
