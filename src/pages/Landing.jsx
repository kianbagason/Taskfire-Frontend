import { Link } from 'react-router-dom';
import { FiCheckCircle, FiStar, FiAward, FiSmartphone } from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Ignite Your Productivity with <span className="highlight">TaskFire</span> 🔥
          </h1>
          <p className="hero-subtitle">
            Track your daily tasks, build streaks, and gamify your productivity journey
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary">Get Started Free</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why TaskFire?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FiCheckCircle className="feature-icon" />
            <h3>Simple Task Management</h3>
            <p>Create, organize, and complete tasks with ease</p>
          </div>

          <div className="feature-card">
            <FiStar className="feature-icon" />
            <h3>Build Streaks</h3>
            <p>Maintain daily streaks and watch your productivity soar</p>
          </div>

          <div className="feature-card">
            <FiAward className="feature-icon" />
            <h3>Gamification</h3>
            <p>Earn fire labels and track your achievements</p>
          </div>

          <div className="feature-card">
            <FiSmartphone className="feature-icon" />
            <h3>Mobile First</h3>
            <p>Perfectly optimized for your mobile device</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
