import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MealCard from '../components/MealCard';
import ShoppingList from '../components/ShoppingList';
import AddMealModal from '../components/AddMealModal';
import { mockMeals, ALL_TAGS, type Meal } from '../data/mockMeals';

const STORAGE_MEALS = 'mp_meals';
const STORAGE_SELECTED = 'mp_selected';

function loadMeals(): Meal[] {
  const saved = localStorage.getItem(STORAGE_MEALS);
  return saved ? JSON.parse(saved) : mockMeals;
}

function loadSelected(): string[] {
  const saved = localStorage.getItem(STORAGE_SELECTED);
  return saved ? JSON.parse(saved) : [];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('mp_auth') || 'null');

  const [meals, setMeals] = useState<Meal[]>(loadMeals);
  const [selectedIds, setSelectedIds] = useState<string[]>(loadSelected);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  function toggleMeal(id: string) {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_SELECTED, JSON.stringify(next));
      return next;
    });
  }

  function addMeal(meal: Meal) {
    const next = [...meals, meal];
    setMeals(next);
    localStorage.setItem(STORAGE_MEALS, JSON.stringify(next));
  }

  function logout() {
    localStorage.removeItem('mp_auth');
    navigate('/login');
  }

  const displayed = meals
    .filter(m => !activeTag || m.tags.includes(activeTag))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedMeals = meals.filter(m => selectedIds.includes(m.id));

  return (
    <div className="dashboard">
      <nav className="topbar">
        <span className="topbar-brand">ben<span>to</span></span>
        <div className="topbar-actions">
          <button className="btn-add-meal" onClick={() => setShowModal(true)}>
            + Add Meal
          </button>
          <button className="btn-logout" onClick={logout}>
            {auth?.username} · Sign out
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        <main className="meals-panel">
          <div className="panel-header">
            <span className="panel-title">My Meals</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {displayed.length} meal{displayed.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="filter-bar">
            <button
              className={`filter-chip${activeTag === null ? ' active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                className={`filter-chip${activeTag === tag ? ' active' : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="meals-grid">
            {displayed.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                selected={selectedIds.includes(meal.id)}
                onToggle={toggleMeal}
              />
            ))}
          </div>
        </main>

        <ShoppingList selectedMeals={selectedMeals} />
      </div>

      {showModal && (
        <AddMealModal onClose={() => setShowModal(false)} onAdd={addMeal} />
      )}
    </div>
  );
}
