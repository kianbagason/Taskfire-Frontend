import { useState, useEffect } from 'react';
import { petAPI, authAPI } from '../services/api';
import PetShop from './PetShop';

const PetModal = ({ onClose, onRefresh }) => {
  const [pet, setPet] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    fetchPet();
  }, []);

  const fetchPet = async () => {
    try {
      const petResponse = await petAPI.getPet();
      setPet(petResponse.data);
      setNewName(petResponse.data.name);
      
      // Get user coins from profile
      const userData = await authAPI.getProfile();
      setUserCoins(userData.data.coins || 0);
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
      if (onRefresh) onRefresh();
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
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error playing with pet:', error);
      showNotification(error.response?.data?.message || 'Failed to play with pet', true);
    }
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

  const getStatusColor = (value) => {
    if (value >= 70) return '#4CAF50';
    if (value >= 40) return '#FFC107';
    return '#F44336';
  };

  if (showShop) {
    return (
      <PetShop 
        onClose={() => setShowShop(false)}
        onPurchase={() => {
          fetchPet();
          if (onRefresh) onRefresh();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content pet-modal">
          <div className="loading">Loading your pet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pet-modal" onClick={(e) => e.stopPropagation()}>
        {notification && (
          <div className={`pet-notification ${notification.isError ? 'error' : ''}`}>
            {notification.message}
          </div>
        )}

        <div className="pet-modal-header">
          <h2>🐾 My Pet</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="pet-modal-coins">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{userCoins} Coins</span>
          <span className="coins-tip">(Earn by completing tasks!)</span>
        </div>

        <div className="pet-modal-body">
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
              <h3 onClick={() => setIsRenaming(true)} title="Click to rename">
                {pet?.name || 'Buddy'} ✏️
              </h3>
            )}
            <div className="pet-level-badge">Level {pet?.level || 1}</div>
          </div>

          <div className="pet-display-large">
            <div className="pet-avatar-large">
              <span className="pet-emoji-large">{getPetEmoji()}</span>
              {pet?.activeClothes?.hat && <span className="pet-accessory-large hat">🎩</span>}
              {pet?.activeClothes?.glasses && <span className="pet-accessory-large glasses">👓</span>}
              {pet?.activeClothes?.crown && <span className="pet-accessory-large crown">👑</span>}
              {pet?.activeClothes?.scarf && <span className="pet-accessory-large scarf">🧣</span>}
              {pet?.activeClothes?.bowtie && <span className="pet-accessory-large bowtie">🎀</span>}
              {pet?.activeClothes?.cape && <span className="pet-accessory-large cape">🦸</span>}
              {pet?.activeClothes?.hoodie && <span className="pet-accessory-large hoodie">👕</span>}
            </div>
            
            <div className="pet-stats-detailed">
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
            </div>
          </div>

          <div className="pet-action-buttons">
            <div className="action-group">
              <h4>Quick Actions</h4>
              <div className="action-buttons-grid">
                <button 
                  className="action-btn-large feed"
                  onClick={() => handleFeed('basic_food')}
                  disabled={userCoins < 10}
                >
                  <span className="btn-icon">🍖</span>
                  <span className="btn-text">
                    Feed Basic
                    <span className="btn-cost">10 🪙</span>
                  </span>
                </button>
                <button 
                  className="action-btn-large feed"
                  onClick={() => handleFeed('premium_food')}
                  disabled={userCoins < 25}
                >
                  <span className="btn-icon">🥩</span>
                  <span className="btn-text">
                    Feed Premium
                    <span className="btn-cost">25 🪙</span>
                  </span>
                </button>
                <button 
                  className="action-btn-large play"
                  onClick={() => handlePlay('ball')}
                  disabled={userCoins < 15}
                >
                  <span className="btn-icon">⚽</span>
                  <span className="btn-text">
                    Play Ball
                    <span className="btn-cost">15 🪙</span>
                  </span>
                </button>
                <button 
                  className="action-btn-large play"
                  onClick={() => handlePlay('puzzle')}
                  disabled={userCoins < 30}
                >
                  <span className="btn-icon">🧩</span>
                  <span className="btn-text">
                    Brain Puzzle
                    <span className="btn-cost">30 🪙</span>
                  </span>
                </button>
              </div>
            </div>

            <button 
              className="shop-btn-large"
              onClick={() => setShowShop(true)}
            >
              <span className="shop-icon">🛍️</span>
              <span className="shop-text">Open Pet Shop</span>
              <span className="shop-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetModal;
