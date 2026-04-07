import { useState, useEffect } from 'react';
import { petAPI } from '../services/api';

const PetShop = ({ onClose, onPurchase }) => {
  const [shopItems, setShopItems] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('food');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const shopResponse = await petAPI.getShop();
      setShopItems(shopResponse.data);

      const petResponse = await petAPI.getPet();
      setPet(petResponse.data);

      // Get user coins
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      setUserCoins(userData.coins || 0);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item, itemType) => {
    if (userCoins < item.price) {
      showNotification('Not enough coins!', true);
      return;
    }

    try {
      const response = await petAPI.buyItem(item.id, itemType);
      setUserCoins(response.data.user.coins);
      setPet(response.data.pet);
      showNotification(response.data.message);
      
      if (onPurchase) {
        onPurchase();
      }
    } catch (error) {
      console.error('Error buying item:', error);
      showNotification(error.response?.data?.message || 'Purchase failed', true);
    }
  };

  const handleEquip = async (itemId, slot) => {
    try {
      const response = await petAPI.equipClothes(itemId, slot);
      setPet(response.data.pet);
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error equipping item:', error);
      showNotification(error.response?.data?.message || 'Failed to equip', true);
    }
  };

  const handleUnequip = async (slot) => {
    try {
      const response = await petAPI.equipClothes('none', slot);
      setPet(response.data.pet);
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error unequipping item:', error);
      showNotification('Failed to unequip', true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const ownsItem = (itemId) => {
    return pet?.clothes?.includes(itemId);
  };

  const getFoodQuantity = (itemId) => {
    const invItem = pet?.foodInventory?.find(inv => inv.itemId === itemId);
    return invItem ? invItem.quantity : 0;
  };

  const getToyQuantity = (itemId) => {
    const invItem = pet?.toyInventory?.find(inv => inv.itemId === itemId);
    return invItem ? invItem.quantity : 0;
  };

  const isEquipped = (itemId, slot) => {
    return pet?.activeClothes?.[slot] === itemId;
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content shop-modal">
          <div className="loading">Loading shop...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shop-modal" onClick={(e) => e.stopPropagation()}>
        {notification && (
          <div className={`pet-notification ${notification.isError ? 'error' : ''}`}>
            {notification.message}
          </div>
        )}

        <div className="shop-header">
          <h2>🛍️ Pet Shop</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="shop-coins">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{userCoins} Coins</span>
        </div>

        <div className="shop-tabs">
          <button 
            className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => setActiveTab('food')}
          >
            🍖 Food
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clothes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clothes')}
          >
            👕 Clothes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'toys' ? 'active' : ''}`}
            onClick={() => setActiveTab('toys')}
          >
            🎮 Toys
          </button>
        </div>

        <div className="shop-items">
          {activeTab === 'food' && shopItems.food.map(item => {
            const quantity = getFoodQuantity(item.id);
            return (
              <div key={item.id} className={`shop-item ${quantity > 0 ? 'owned' : ''}`}>
                <div className="item-icon">🍖</div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Restores {item.hungerRestore} hunger</p>
                  {quantity > 0 && <span className="owned-badge">In Stock: {quantity}</span>}
                </div>
                <button 
                  className="buy-btn"
                  onClick={() => handleBuy(item, 'food')}
                  disabled={userCoins < item.price}
                >
                  {item.price} 🪙
                </button>
              </div>
            );
          })}

          {activeTab === 'clothes' && shopItems.clothes.map(item => {
            const owned = ownsItem(item.id);
            const equipped = isEquipped(item.id, item.slot);
            
            return (
              <div key={item.id} className={`shop-item ${owned ? 'owned' : ''}`}>
                <div className="item-icon">
                  {item.slot === 'hat' && '🎩'}
                  {item.slot === 'scarf' && '🧣'}
                  {item.slot === 'glasses' && '👓'}
                  {item.slot === 'bowtie' && '🎀'}
                  {item.slot === 'cape' && '🦸'}
                  {item.slot === 'crown' && '👑'}
                  {item.slot === 'hoodie' && '👕'}
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-label">Improvement Item</p>
                  {equipped && <span className="equipped-badge">Equipped</span>}
                  {owned && !equipped && <span className="owned-badge">Owned</span>}
                </div>
                {owned ? (
                  <div className="item-actions">
                    {equipped ? (
                      <button 
                        className="unequip-btn"
                        onClick={() => handleUnequip(item.slot)}
                      >
                        Unequip
                      </button>
                    ) : (
                      <button 
                        className="equip-btn"
                        onClick={() => handleEquip(item.id, item.slot)}
                      >
                        Equip
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    className="buy-btn disabled"
                    disabled={true}
                  >
                    Not Available
                  </button>
                )}
              </div>
            );
          })}

          {activeTab === 'toys' && shopItems.toys.map(item => {
            const quantity = getToyQuantity(item.id);
            return (
              <div key={item.id} className={`shop-item ${quantity > 0 ? 'owned' : ''}`}>
                <div className="item-icon">🎮</div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>+{item.happinessBoost} happiness</p>
                  {quantity > 0 && <span className="owned-badge">In Stock: {quantity}</span>}
                </div>
                <button 
                  className="buy-btn"
                  onClick={() => handleBuy(item, 'toys')}
                  disabled={userCoins < item.price}
                >
                  {item.price} 🪙
                </button>
              </div>
            );
          })}
        </div>

        <div className="shop-tip">
          💡 Tip: Complete tasks to earn more coins!
        </div>
      </div>
    </div>
  );
};

export default PetShop;
