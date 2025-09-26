import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css' // external CSS import

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section section-padding-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title">
            Smart Energy Consumption Optimizer
          </h1>
          <p className="hero-subtitle">
            Optimize your renewable energy usage with AI-powered predictions and smart recommendations
          </p>
          <div className="btn-group">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Why Choose Our Energy Optimizer?
            </h2>
            <p className="section-subtitle">
              Experience the future of energy management with our cutting-edge technology
            </p>
          </div>
          <div className="feature-cards">
            {[
              {
                emoji: "🌱",
                title: "Renewable Energy Focus",
                desc: "Optimize solar and wind energy usage with real-time weather predictions and smart scheduling",
                bg: "green",
              },
              {
                emoji: "📊",
                title: "Smart Analytics",
                desc: "Get detailed insights into your energy consumption patterns and cost savings",
                bg: "blue",
              },
              {
                emoji: "⚡",
                title: "AI-Powered Predictions",
                desc: "Receive optimal time recommendations for running your appliances based on weather forecasts",
                bg: "purple",
              },
            ].map(({ emoji, title, desc, bg }) => (
              <div key={title} className={`feature-card ${bg}`}>
                <div className="feature-icon">{emoji}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              How It Works
            </h2>
            <p className="section-subtitle">
              Get started in just four simple steps
            </p>
          </div>
          <div className="steps-grid">
            {[1, 2, 3, 4].map((num) => {
              let titles = [
                "Setup Your System",
                "Get Predictions",
                "Optimize Usage",
                "Track Results"
              ]
              let descriptions = [
                "Configure your renewable energy resources and devices",
                "Receive AI-powered energy generation forecasts",
                "Follow recommendations for optimal appliance scheduling",
                "Monitor your energy savings and consumption patterns"
              ]
              return (
                <div key={num} className="step-card">
                  <div className="step-number">{num}</div>
                  <h3>{titles[num-1]}</h3>
                  <p>{descriptions[num-1]}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section-padding bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title-light">
            Ready to Optimize Your Energy?
          </h2>
          <p className="section-subtitle-light">
            Join thousands of users who are already saving energy and reducing costs
          </p>
          {!user && (
            <Link to="/signup" className="btn btn-primary-light">
              Start Your Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section bg-gray-900 text-white section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="footer-grid">
            <div className="footer-logo-area">
              <div className="footer-logo-icon">⚡</div>
              <span className="footer-logo-text">Energy Optimizer</span>
              <p className="footer-description">
                Smart energy management for a sustainable future
              </p>
            </div>
            <div>
              <h3>Product</h3>
              <ul className="footer-links">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/reports">Reports</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/tips">Energy Tips</Link></li>
              </ul>
            </div>
            <div>
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3>Company</h3>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Energy Optimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
