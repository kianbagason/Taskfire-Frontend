import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { petAPI, authAPI } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [petData, setPetData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPetData();
      
      // Set up polling to check for pet updates every 30 seconds
      const petPollInterval = setInterval(() => {
        fetchPetData();
      }, 30000); // 30 seconds
      
      // Refresh data when window gains focus
      const handleFocus = () => {
        fetchPetData();
      };
      
      // Also listen for visibility change
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchPetData();
        }
      };
      
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(petPollInterval);
      };
    }
  }, [user]);

  const fetchPetData = async () => {
    try {
      const petResponse = await petAPI.getPet();
      setPetData(petResponse.data);
    } catch (error) {
      console.error('Error fetching pet data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePetClick = () => {
    navigate('/pet');
    setMenuOpen(false);
  };

  const getPetEmoji = () => {
    if (!petData) return '🐱';
    const emojis = {
      cat: '🐱',
      dog: '🐶',
      rabbit: '🐰',
      hamster: '🐹',
      penguin: '🐧',
      fox: '🦊'
    };
    return emojis[petData.type] || '🐱';
  };

  const getSmallPetSVG = () => {
    if (!petData) return null;
    
    const colors = {
      cat: { body: '#FFA726', ears: '#FF9800' },
      dog: { body: '#8D6E63', ears: '#6D4C41' },
      rabbit: { body: '#F5F5F5', ears: '#FFCDD2' },
      hamster: { body: '#FFCC80', ears: '#FFB74D' },
      penguin: { body: '#424242', ears: '#212121' },
      fox: { body: '#FF7043', ears: '#E64A19' }
    };

    const color = colors[petData.type] || colors.cat;

    return (
      <svg viewBox="0 0 40 40" className="navbar-pet-svg">
        <g className="navbar-pet-bounce">
          {/* Simple body */}
          <circle cx="20" cy="22" r="12" fill={color.body} />
          {/* Head */}
          <circle cx="20" cy="16" r="10" fill={color.body} />
          {/* Ears */}
          <ellipse cx="14" cy="9" rx="3" ry="5" fill={color.ears} />
          <ellipse cx="26" cy="9" rx="3" ry="5" fill={color.ears} />
          {/* Eyes */}
          <circle cx="17" cy="15" r="1.5" fill="#333" />
          <circle cx="23" cy="15" r="1.5" fill="#333" />
          {/* Nose */}
          <circle cx="20" cy="18" r="1" fill="#FF6B6B" />
        </g>
      </svg>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🔥 TaskFire
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              
              {/* Pet Icon */}
              <button 
                className="pet-icon-btn"
                onClick={handlePetClick}
                title="View your pet"
              >
                <span className="pet-svg-container">{getSmallPetSVG()}</span>
              </button>
              
              <span className="user-welcome">Hi, {user.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
