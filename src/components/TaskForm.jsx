import { useState } from 'react';

const TaskForm = ({ onSubmit, onBuildHabit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-header">
        <h2>Add New Task</h2>
        <button 
          type="button"
          className="btn-build-habit-inline"
          onClick={onBuildHabit}
        >
          🎯 Build Habit
        </button>
      </div>
      
      <div className="form-group">
        <input
          type="text"
          name="title"
          placeholder="Task title *"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-submit">
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
