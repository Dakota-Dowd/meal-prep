import { useState } from 'react';
import type { Meal } from '../data/mockMeals';

interface Props {
  selectedMeals: Meal[];
  onClear: () => void;
}

interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

function aggregate(meals: Meal[]): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();
  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const key = `${ing.name.toLowerCase()}__${ing.unit}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += ing.quantity;
      } else {
        map.set(key, { name: ing.name, quantity: ing.quantity, unit: ing.unit });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function ShoppingList({ selectedMeals, onClear }: Props) {
  const [copied, setCopied] = useState(false);
  const items = aggregate(selectedMeals);

  function handleCopy() {
    const text = items.map(i => `${i.name} — ${i.quantity} ${i.unit}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <aside className="shopping-sidebar">
      <div className="panel-header">
        <span className="panel-title">Grocery List</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {selectedMeals.length} meal{selectedMeals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="shopping-empty">
          <div className="icon">🛒</div>
          <p>Select meals and click "Add to grocery list".</p>
        </div>
      ) : (
        <>
          <ul className="ingredient-list">
            {items.map(item => (
              <li key={`${item.name}__${item.unit}`} className="ingredient-item">
                <span className="ingredient-name">{item.name}</span>
                <span className="ingredient-amount">{item.quantity} {item.unit}</span>
              </li>
            ))}
          </ul>
          <button
            className={`btn-copy${copied ? ' copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy List'}
          </button>
          <button className="btn-clear" onClick={onClear}>
            Clear grocery list
          </button>
        </>
      )}
    </aside>
  );
}
