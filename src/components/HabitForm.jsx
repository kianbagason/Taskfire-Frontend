import { useState } from 'react';
import { FiX } from 'react-icons/fi';

const HabitForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'high'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'high'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>
        
        <h2>🎯 Build a Habit</h2>
        <p className="modal-subtitle">Create a daily habit that automatically appears each day</p>

        <form onSubmit={handleSubmit} className="habit-form">
          <div className="form-group">
            <label>Habit Name *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Morning Exercise, Read 30 mins"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              name="description"
              placeholder="Add details about your habit..."
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="high">🔴 High - Most Important</option>
              <option value="medium">🟡 Medium - Important</option>
              <option value="low">🟢 Low - Nice to Have</option>
            </select>
          </div>

          <div className="habit-info">
            <p>✨ This habit will automatically create a task every day</p>
            <p>📊 Tasks are sorted by priority: High → Medium → Low</p>
          </div>

          <button type="submit" className="btn-submit btn-habit">
            🚀 Start This Habit
          </button>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
