import { useState, useEffect } from 'react';
import { taskAPI, habitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import HabitForm from '../components/HabitForm';
import StreakDisplay from '../components/StreakDisplay';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await taskAPI.createTask(taskData);
      fetchTasks();
      showNotification('Task added successfully! ✓');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      await habitAPI.createHabit(habitData);
      fetchTasks();
      setShowHabitForm(false);
      showNotification(`Habit "${habitData.title}" created! It will appear daily 🎯`);
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleToggleComplete = async (id, completed) => {
    console.log('🔄 handleToggleComplete called:', { id, completed });
    try {
      console.log('📡 Calling taskAPI.updateTask...');
      const response = await taskAPI.updateTask(id, { completed });
      console.log('✅ API response:', response.data);
      
      fetchTasks();
      
      if (completed) {
        console.log('💰 Task completed - should have earned 10 coins');
        showNotification('Task completed! 🔥 Keep it up! +10 coins 🪙');
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskAPI.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Calculate tasks completed today
  const todayCompleted = tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  if (loading) {
    return <div className="loading">Loading your tasks...</div>;
  }

  return (
    <div className="dashboard">
      {/* Notification */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Your Tasks</h1>
        <p>Keep the fire burning! 🔥</p>
      </div>

      <StreakDisplay
        currentStreak={user?.currentStreak || 0}
        longestStreak={user?.longestStreak || 0}
        todayCompleted={todayCompleted}
      />

      <TaskForm 
        onSubmit={handleAddTask}
        onBuildHabit={() => setShowHabitForm(true)}
      />

      <div className="task-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Start by adding a new task or building a habit!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm 
          onSubmit={handleCreateHabit}
          onClose={() => setShowHabitForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
