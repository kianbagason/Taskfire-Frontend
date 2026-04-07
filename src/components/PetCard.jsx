import { useState, useEffect } from 'react';
import { petAPI } from '../services/api';

const PetCard = ({ onOpenShop }) => {
  const [pet, setPet] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchPet();
  }, []);

  const fetchPet = async () => {
    try {
      const petResponse = await petAPI.getPet();
      setPet(petResponse.data);
      setNewName(petResponse.data.name);
      
      // Get user coins from profile
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      setUserCoins(userData.coins || 0);
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

  if (loading) {
    return <div className="pet-card loading">Loading your pet...</div>;
  }

  return (
    <div className="pet-card">
      {notification && (
        <div className={`pet-notification ${notification.isError ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="pet-header">
        <div className="pet-info">
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
          <div className="pet-level">Level {pet?.level || 1}</div>
        </div>
        <div className="coins-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{userCoins}</span>
        </div>
      </div>

      <div className="pet-display">
        <div className="pet-avatar">
          <span className="pet-emoji">{getPetEmoji()}</span>
          {pet?.activeClothes?.hat && <span className="pet-accessory hat">🎩</span>}
          {pet?.activeClothes?.glasses && <span className="pet-accessory glasses">👓</span>}
          {pet?.activeClothes?.crown && <span className="pet-accessory crown">👑</span>}
        </div>
        
        <div className="pet-stats">
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
            </div>
          </div>

          <div className="stat-bar">
            <label>Experience ⭐</label>
            <div className="bar-container">
              <div 
                className="bar-fill experience"
                style={{ width: `${((pet?.experience || 0) / ((pet?.level || 1) * 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pet-actions">
        <button 
          className="action-btn feed"
          onClick={() => handleFeed('basic_food')}
          disabled={userCoins < 10}
          title="Feed - 10 coins"
        >
          🍖 Feed (10🪙)
        </button>
        <button 
          className="action-btn play"
          onClick={() => handlePlay('ball')}
          disabled={userCoins < 15}
          title="Play - 15 coins"
        >
          🎮 Play (15🪙)
        </button>
        <button 
          className="action-btn shop"
          onClick={onOpenShop}
        >
          🛍️ Shop
        </button>
      </div>
    </div>
  );
};

export default PetCard;
