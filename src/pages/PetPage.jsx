import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { petAPI, authAPI } from '../services/api';
import PetShop from '../components/PetShop';

const PetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [previousCoins, setPreviousCoins] = useState(0);
  const [coinChange, setCoinChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showShop, setShowShop] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Fetch user profile to get current coins
  const fetchUserCoins = async () => {
    try {
      const response = await authAPI.getProfile();
      const newCoins = response.data.coins || 0;
      
      console.log('Fetched coins:', newCoins, 'Previous:', userCoins);
      
      // Track coin changes
      if (newCoins !== userCoins) {
        setPreviousCoins(userCoins);
        setCoinChange(newCoins - userCoins);
        setUserCoins(newCoins);
        setLastFetchTime(Date.now());
        console.log('Coins updated from', userCoins, 'to', newCoins);
        
        // Clear the change indicator after 3 seconds
        setTimeout(() => {
          setCoinChange(0);
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  useEffect(() => {
    fetchPet();
    
    // Immediate refresh when component mounts or route changes
    fetchUserCoins();
    
    // Set up polling to check for coin updates every 30 seconds (reduced from 1s)
    const coinPollInterval = setInterval(() => {
      fetchUserCoins();
    }, 30000); // 30 seconds instead of 1 second
    
    // Refresh data when page gains focus (user returns from dashboard)
    const handleFocus = () => {
      fetchPet();
      fetchUserCoins();
    };
    
    // Also listen for visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserCoins();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(coinPollInterval);
    };
  }, [location.pathname]); // Re-run when route changes

  const fetchPet = async () => {
    try {
      const petResponse = await petAPI.getPet();
      setPet(petResponse.data);
      setNewName(petResponse.data.name);
      
      // Fetch coins separately
      await fetchUserCoins();
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeed = async (foodId) => {
    try {
      const response = await petAPI.feedPet(foodId);
      setPet(response.data.pet);
      setUserCoins(response.data.user.coins);
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error feeding pet:', error);
      showNotification(error.response?.data?.message || 'Failed to feed pet', true);
    }
  };

  const handlePlay = async (toyId) => {
    try {
      const response = await petAPI.playWithPet(toyId);
      setPet(response.data.pet);
      setUserCoins(response.data.user.coins);
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error playing with pet:', error);
      showNotification(error.response?.data?.message || 'Failed to play with pet', true);
    }
  };

  const getFoodQuantity = (foodId) => {
    const invItem = pet?.foodInventory?.find(inv => inv.itemId === foodId);
    return invItem ? invItem.quantity : 0;
  };

  const getToyQuantity = (toyId) => {
    const invItem = pet?.toyInventory?.find(inv => inv.itemId === toyId);
    return invItem ? invItem.quantity : 0;
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    
    try {
      const response = await petAPI.renamePet(newName);
      setPet(response.data.pet);
      setIsRenaming(false);
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error renaming pet:', error);
      showNotification('Failed to rename pet', true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const getPetEmoji = () => {
    if (!pet) return '🐱';
    const emojis = {
      cat: '🐱',
      dog: '🐶',
      rabbit: '🐰',
      hamster: '🐹',
      penguin: '🐧',
      fox: '🦊'
    };
    return emojis[pet.type] || '🐱';
  };

  const getEvolutionStageName = (stage) => {
    const stages = {
      1: 'Baby',
      2: 'Young',
      3: 'Adult',
      4: 'Mature',
      5: 'Fierce'
    };
    return stages[stage] || 'Baby';
  };

  const getEvolutionColor = (stage) => {
    const colors = {
      1: '#90EE90', // Light green (Baby)
      2: '#87CEEB', // Sky blue (Young)
      3: '#FFA500', // Orange (Adult)
      4: '#FF4500', // Orange-Red (Mature)
      5: '#DC143C'  // Crimson (Fierce)
    };
    return colors[stage] || '#90EE90';
  };

  const getStatusColor = (value) => {
    if (value >= 70) return '#4CAF50';
    if (value >= 40) return '#FFC107';
    return '#F44336';
  };

  const getPetSVG = () => {
    if (!pet) return null;
    
    const petConfigs = {
      cat: {
        body: '#FFA726',
        ears: '#FF9800',
        face: '#FFE0B2'
      },
      dog: {
        body: '#8D6E63',
        ears: '#6D4C41',
        face: '#D7CCC8'
      },
      rabbit: {
        body: '#F5F5F5',
        ears: '#FFCDD2',
        face: '#FFFFFF'
      },
      hamster: {
        body: '#FFCC80',
        ears: '#FFB74D',
        face: '#FFE0B2'
      },
      penguin: {
        body: '#424242',
        ears: '#212121',
        face: '#FFFFFF'
      },
      fox: {
        body: '#FF7043',
        ears: '#E64A19',
        face: '#FFCCBC'
      }
    };

    const config = petConfigs[pet.type] || petConfigs.cat;
    const evolutionStage = pet.evolutionStage || 1;
    
    // Evolution affects appearance
    const sizeMultiplier = 1 + (evolutionStage - 1) * 0.08; // Gets 8% bigger per stage
    const hasScars = evolutionStage >= 4; // Mature and Fierce have battle scars
    const hasGlow = evolutionStage === 5; // Fierce stage has glowing eyes
    const eyeColor = evolutionStage >= 4 ? '#FF0000' : '#333'; // Red eyes for mature+

    return (
      <svg viewBox="0 0 200 200" className="animated-pet-svg">
        {/* Evolution glow effect for Fierce stage */}
        {hasGlow && (
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        )}
        
        {/* Body bounce animation */}
        <g className="pet-body-bounce" transform={`scale(${sizeMultiplier}) translate(${(1 - sizeMultiplier) * 100}, ${(1 - sizeMultiplier) * 100})`}>
          {/* Body */}
          <ellipse cx="100" cy="130" rx="50" ry="45" fill={config.body} />
          
          {/* Head */}
          <circle cx="100" cy="80" r="40" fill={config.body} />
          
          {/* Face */}
          <ellipse cx="100" cy="85" rx="25" ry="20" fill={config.face} />
          
          {/* Ears - get pointier with evolution */}
          <ellipse cx="75" cy="50" rx={12 - evolutionStage * 0.5} ry={18 + evolutionStage * 2} fill={config.ears} className="ear-left" />
          <ellipse cx="125" cy="50" rx={12 - evolutionStage * 0.5} ry={18 + evolutionStage * 2} fill={config.ears} className="ear-right" />
          
          {/* Eyes - glow for fierce stage */}
          <circle cx="88" cy="75" r="5" fill={eyeColor} className="eye-left" filter={hasGlow ? "url(#glow)" : ""} />
          <circle cx="112" cy="75" r="5" fill={eyeColor} className="eye-right" filter={hasGlow ? "url(#glow)" : ""} />
          <circle cx="90" cy="73" r="2" fill="white" className="eye-shine-left" />
          <circle cx="114" cy="73" r="2" fill="white" className="eye-shine-right" />
          
          {/* Nose */}
          <ellipse cx="100" cy="88" rx="4" ry="3" fill="#FF6B6B" />
          
          {/* Mouth - fiercer expression at higher stages */}
          {evolutionStage >= 4 ? (
            <path d="M 92 92 Q 100 88 108 92" stroke="#333" strokeWidth="2.5" fill="none" />
          ) : (
            <path d="M 95 92 Q 100 96 105 92" stroke="#333" strokeWidth="2" fill="none" />
          )}
          
          {/* Whiskers - longer for higher stages */}
          <line x1="70" y1="85" x2="85" y2="87" stroke="#333" strokeWidth={1.5 + evolutionStage * 0.2} />
          <line x1="70" y1="90" x2="85" y2="90" stroke="#333" strokeWidth={1.5 + evolutionStage * 0.2} />
          <line x1="115" y1="87" x2="130" y2="85" stroke="#333" strokeWidth={1.5 + evolutionStage * 0.2} />
          <line x1="115" y1="90" x2="130" y2="90" stroke="#333" strokeWidth={1.5 + evolutionStage * 0.2} />
          
          {/* Battle scars for Mature and Fierce */}
          {hasScars && (
            <>
              <line x1="85" y1="70" x2="90" y2="78" stroke="#8B0000" strokeWidth="2" opacity="0.6" />
              <line x1="115" y1="72" x2="110" y2="80" stroke="#8B0000" strokeWidth="2" opacity="0.6" />
            </>
          )}
          
          {/* Paws - bigger for higher stages */}
          <ellipse cx="75" cy="165" rx={12 + evolutionStage} ry={8 + evolutionStage * 0.5} fill={config.face} className="paw-left" />
          <ellipse cx="125" cy="165" rx={12 + evolutionStage} ry={8 + evolutionStage * 0.5} fill={config.face} className="paw-right" />
          
          {/* Tail wag animation - more aggressive for higher stages */}
          <g className="tail-wag">
            <path 
              d={pet.type === 'cat' ? "M 150 130 Q 170 110 165 90" : 
                 pet.type === 'dog' ? "M 150 130 Q 175 120 170 100" :
                 "M 150 130 Q 165 115 160 95"}
              stroke={config.body} 
              strokeWidth={8 + evolutionStage} 
              fill="none" 
              strokeLinecap="round"
            />
          </g>
        </g>
        
        {/* Blush when happy */}
        {pet.happiness > 70 && (
          <>
            <circle cx="80" cy="92" r="6" fill="#FFB6C1" opacity="0.6" className="blush-left" />
            <circle cx="120" cy="92" r="6" fill="#FFB6C1" opacity="0.6" className="blush-right" />
          </>
        )}
      </svg>
    );
  };

  if (showShop) {
    return (
      <PetShop 
        onClose={() => setShowShop(false)}
        onPurchase={() => {
          fetchPet();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading your pet...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {notification && (
        <div className={`pet-notification ${notification.isError ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="pet-page-content">
        <div className="pet-coins-banner">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{userCoins} Coins</span>
          {coinChange !== 0 && (
            <span className={`coin-change-indicator ${coinChange > 0 ? 'positive' : 'negative'}`}>
              {coinChange > 0 ? '+' : ''}{coinChange}
            </span>
          )}
          <span className="coins-tip">(Complete tasks to earn more!)</span>
        </div>

        <div className="pet-main-display">
          <div className="pet-info-section">
            {isRenaming ? (
              <div className="rename-form">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  onBlur={handleRename}
                  autoFocus
                  maxLength={20}
                />
              </div>
            ) : (
              <h2 onClick={() => setIsRenaming(true)} title="Click to rename">
                {pet?.name || 'Buddy'} ✏️
              </h2>
            )}
            <div className={`pet-level-badge evolution-${getEvolutionStageName(pet?.evolutionStage || 1).toLowerCase()}`}>
              Level {pet?.level || 1} • {getEvolutionStageName(pet?.evolutionStage || 1)}
            </div>
          </div>

          <div className="pet-avatar-section">
            <div className="pet-avatar-xl">
              {getPetSVG()}
              {pet?.activeClothes?.hat && <span className="pet-accessory-xl hat">🎩</span>}
              {pet?.activeClothes?.glasses && <span className="pet-accessory-xl glasses">👓</span>}
              {pet?.activeClothes?.crown && <span className="pet-accessory-xl crown">👑</span>}
              {pet?.activeClothes?.scarf && <span className="pet-accessory-xl scarf">🧣</span>}
              {pet?.activeClothes?.bowtie && <span className="pet-accessory-xl bowtie">🎀</span>}
              {pet?.activeClothes?.cape && <span className="pet-accessory-xl cape">🦸</span>}
              {pet?.activeClothes?.hoodie && <span className="pet-accessory-xl hoodie">👕</span>}
            </div>
          </div>
          
          <div className="pet-stats-comprehensive">
            <h3>Pet Stats</h3>
            <div className="stat-bar">
              <label>Happiness 😊</label>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${pet?.happiness || 50}%`,
                    backgroundColor: getStatusColor(pet?.happiness || 50)
                  }}
                />
                <span className="stat-value">{pet?.happiness || 50}/100</span>
              </div>
            </div>

            <div className="stat-bar">
              <label>Hunger 🍖</label>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${pet?.hunger || 50}%`,
                    backgroundColor: getStatusColor(pet?.hunger || 50)
                  }}
                />
                <span className="stat-value">{pet?.hunger || 50}/100</span>
              </div>
            </div>

            <div className="stat-bar">
              <label>Energy ⚡</label>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${pet?.energy || 50}%`,
                    backgroundColor: getStatusColor(pet?.energy || 50)
                  }}
                />
                <span className="stat-value">{pet?.energy || 50}/100</span>
              </div>
            </div>

            <div className="stat-bar">
              <label>Experience ⭐</label>
              <div className="bar-container">
                <div 
                  className="bar-fill experience"
                  style={{ width: `${((pet?.experience || 0) / ((pet?.level || 1) * 100)) * 100}%` }}
                />
                <span className="stat-value">{pet?.experience || 0}/{(pet?.level || 1) * 100}</span>
              </div>
            </div>

            <div className="stat-bar">
              <label>Cuteness 💖</label>
              <div className="bar-container">
                <div 
                  className="bar-fill cuteness"
                  style={{ 
                    width: `${pet?.cuteness || 0}%`,
                    backgroundColor: '#FF69B4'
                  }}
                />
                <span className="stat-value">{pet?.cuteness || 0}/100</span>
              </div>
              <small className="stat-hint">Equip clothes to increase cuteness!</small>
            </div>
          </div>
        </div>

        <div className="pet-actions-section">
          <div className="action-group">
            <h3>Quick Actions</h3>
            <div className="action-buttons-grid">
              <button 
                className="action-btn-xl feed"
                onClick={() => handleFeed('basic_food')}
                disabled={getFoodQuantity('basic_food') === 0}
              >
                <span className="btn-icon">🍖</span>
                <div className="btn-details">
                  <span className="btn-title">Feed Basic</span>
                  <span className="btn-description">+20 hunger</span>
                  <span className="btn-cost">{getFoodQuantity('basic_food')} in stock</span>
                </div>
              </button>

              <button 
                className="action-btn-xl feed"
                onClick={() => handleFeed('premium_food')}
                disabled={getFoodQuantity('premium_food') === 0}
              >
                <span className="btn-icon">🥩</span>
                <div className="btn-details">
                  <span className="btn-title">Feed Premium</span>
                  <span className="btn-description">+50 hunger</span>
                  <span className="btn-cost">{getFoodQuantity('premium_food')} in stock</span>
                </div>
              </button>

              <button 
                className="action-btn-xl feed"
                onClick={() => handleFeed('deluxe_meal')}
                disabled={getFoodQuantity('deluxe_meal') === 0}
              >
                <span className="btn-icon">🍽️</span>
                <div className="btn-details">
                  <span className="btn-title">Deluxe Meal</span>
                  <span className="btn-description">+100 hunger</span>
                  <span className="btn-cost">{getFoodQuantity('deluxe_meal')} in stock</span>
                </div>
              </button>

              <button 
                className="action-btn-xl play"
                onClick={() => handlePlay('ball')}
                disabled={getToyQuantity('ball') === 0}
              >
                <span className="btn-icon">⚽</span>
                <div className="btn-details">
                  <span className="btn-title">Play Ball</span>
                  <span className="btn-description">+15 happiness</span>
                  <span className="btn-cost">{getToyQuantity('ball')} in stock</span>
                </div>
              </button>

              <button 
                className="action-btn-xl play"
                onClick={() => handlePlay('puzzle')}
                disabled={getToyQuantity('puzzle') === 0}
              >
                <span className="btn-icon">🧩</span>
                <div className="btn-details">
                  <span className="btn-title">Brain Puzzle</span>
                  <span className="btn-description">+30 happiness</span>
                  <span className="btn-cost">{getToyQuantity('puzzle')} in stock</span>
                </div>
              </button>

              <button 
                className="action-btn-xl play"
                onClick={() => handlePlay('treasure')}
                disabled={getToyQuantity('treasure') === 0}
              >
                <span className="btn-icon">🗺️</span>
                <div className="btn-details">
                  <span className="btn-title">Treasure Hunt</span>
                  <span className="btn-description">+50 happiness</span>
                  <span className="btn-cost">{getToyQuantity('treasure')} in stock</span>
                </div>
              </button>
            </div>
          </div>

          <button 
            className="shop-btn-xl"
            onClick={() => setShowShop(true)}
          >
            <span className="shop-icon">🛍️</span>
            <div className="shop-details">
              <span className="shop-title">Open Pet Shop</span>
              <span className="shop-description">Buy food, clothes & toys</span>
            </div>
            <span className="shop-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetPage;
