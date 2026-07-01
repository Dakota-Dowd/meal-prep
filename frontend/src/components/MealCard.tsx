import type { Meal } from '../data/mockMeals';

interface Props {
  meal: Meal;
  staged: boolean;
  onStage: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function MealCard({ meal, staged, onStage, onOpen }: Props) {
  return (
    <div className="meal-card" onClick={() => onOpen(meal.id)}>
      <div className="meal-card-top">
        <span className="meal-card-name">
          {meal.name}
          {meal.url && (
            <a
              href={meal.url}
              target="_blank"
              rel="noreferrer"
              className="meal-url-icon"
              onClick={e => e.stopPropagation()}
            >
              🔗
            </a>
          )}
        </span>
      </div>

      {meal.rating !== undefined && (
        <div className="meal-stars">{'★'.repeat(meal.rating)}</div>
      )}

      {meal.prep_time_minutes !== undefined && (
        <div className="meal-prep-time">⏱ {meal.prep_time_minutes} min</div>
      )}

      <div className="meal-tags">
        {meal.tags.map(tag => (
          <span key={tag} className="meal-tag">{tag}</span>
        ))}
      </div>

      <div className="meal-card-bottom">
        <span className="meal-ingredient-count">
          {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
        </span>
        <input
          type="checkbox"
          className="meal-checkbox"
          checked={staged}
          onChange={() => onStage(meal.id)}
          onClick={e => e.stopPropagation()}
          title="Add to grocery list"
        />
      </div>
    </div>
  );
}
