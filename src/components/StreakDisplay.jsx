import { FiStar, FiAward } from 'react-icons/fi';

const StreakDisplay = ({ currentStreak, longestStreak, todayCompleted }) => {
  return (
    <div className="streak-display">
      <div className="streak-card current-streak">
        <FiStar className="streak-icon fire" />
        <div className="streak-info">
          <h3>Current Streak</h3>
          <p className="streak-number">{currentStreak} days</p>
        </div>
      </div>

      <div className="streak-card best-streak">
        <FiAward className="streak-icon trophy" />
        <div className="streak-info">
          <h3>Best Streak</h3>
          <p className="streak-number">{longestStreak} days</p>
        </div>
      </div>

      <div className="streak-card total-tasks">
        <div className="streak-icon check">✓</div>
        <div className="streak-info">
          <h3>Completed Today</h3>
          <p className="streak-number">{todayCompleted}</p>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
