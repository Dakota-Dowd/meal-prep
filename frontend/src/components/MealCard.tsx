import type { Meal } from '../data/mockMeals';

interface Props {
  meal: Meal;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function MealCard({ meal, selected, onToggle }: Props) {
  return (
    <div
      className={`meal-card${selected ? ' selected' : ''}`}
      onClick={() => onToggle(meal.id)}
    >
      <div className="meal-card-top">
        <span className="meal-card-name">{meal.name}</span>
        <input
          type="checkbox"
          className="meal-checkbox"
          checked={selected}
          onChange={() => onToggle(meal.id)}
          onClick={e => e.stopPropagation()}
        />
      </div>
      <div className="meal-tags">
        {meal.tags.map(tag => (
          <span key={tag} className="meal-tag">{tag}</span>
        ))}
      </div>
      <div className="meal-ingredient-count">
        {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
