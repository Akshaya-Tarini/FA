import './StatsCard.css';

const StatsCard = ({ title, value, icon, color = 'var(--accent-primary)' }) => {
  return (
    <div className="stats-card glass-card" data-testid={`stats-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="stats-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stats-info">
        <span className="stats-value">{value ?? '—'}</span>
        <span className="stats-title">{title}</span>
      </div>
    </div>
  );
};

export default StatsCard;
