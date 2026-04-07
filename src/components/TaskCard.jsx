import { FiCheck, FiTrash2, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const handleDelete = () => {
    const userInput = prompt(`To delete this task, type the task title:\n\n"${task.title}"`);
    
    if (userInput === null) {
      // User cancelled
      return;
    }
    
    if (userInput.trim() === task.title) {
      onDelete(task._id);
    } else {
      alert('Task title does not match. Deletion cancelled.');
    }
  };

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-badges">
          {task.isHabit && (
            <span className="habit-badge" title="Daily Habit">
              🎯 {task.habitProgress?.current || 0}/{task.habitProgress?.total || 90}
            </span>
          )}
          {task.hasFireLabel && task.completed && (
            <FiStar className="fire-label" title="Completed today!" />
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.dueDate && (
          <span className="task-due-date">
            Due: {formatDate(task.dueDate)}
          </span>
        )}
        <span className={`task-priority ${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <div className="task-actions">
        <button
          onClick={() => onToggleComplete(task._id, !task.completed)}
          className={`btn-complete ${task.completed ? 'completed' : ''}`}
        >
          <FiCheck />
          {task.completed ? 'Completed' : 'Complete'}
        </button>
        <button
          onClick={handleDelete}
          className="btn-delete"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
