import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MealCard from '../components/MealCard';
import ShoppingList from '../components/ShoppingList';
import AddMealModal from '../components/AddMealModal';
import MealDetailModal from '../components/MealDetailModal';
import { ALL_TAGS, type Meal } from '../data/mockMeals';

const STORAGE_MEALS = 'mp_meals';
const STORAGE_SELECTED = 'mp_selected';

function loadMeals(): Meal[] {
  const saved = localStorage.getItem(STORAGE_MEALS);
  return saved ? JSON.parse(saved) : [];
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
  const [stagedIds, setStagedIds] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);

  function stageMeal(id: string) {
    setStagedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function commitToGroceryList() {
    setSelectedIds(prev => {
      const next = Array.from(new Set([...prev, ...stagedIds]));
      localStorage.setItem(STORAGE_SELECTED, JSON.stringify(next));
      return next;
    });
    setStagedIds([]);
  }

  function clearGroceryList() {
    setSelectedIds([]);
    localStorage.setItem(STORAGE_SELECTED, JSON.stringify([]));
  }

  function addMeal(meal: Meal) {
    const next = [...meals, meal];
    setMeals(next);
    localStorage.setItem(STORAGE_MEALS, JSON.stringify(next));
  }

  function saveMeal(updated: Meal) {
    const next = meals.map(m => m.id === updated.id ? updated : m);
    setMeals(next);
    localStorage.setItem(STORAGE_MEALS, JSON.stringify(next));
  }

  function openDetail(id: string) {
    const meal = meals.find(m => m.id === id);
    if (meal) setDetailMeal(meal);
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
        <span className="topbar-brand">Meal Prep</span>
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

          {stagedIds.length > 0 && (
            <div className="grocery-banner">
              <span>{stagedIds.length} meal{stagedIds.length !== 1 ? 's' : ''} selected</span>
              <button onClick={commitToGroceryList}>Add to grocery list</button>
            </div>
          )}

          <div className="meals-grid">
            {displayed.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                staged={stagedIds.includes(meal.id)}
                onStage={stageMeal}
                onOpen={openDetail}
              />
            ))}
          </div>
        </main>

        <ShoppingList selectedMeals={selectedMeals} onClear={clearGroceryList} />
      </div>

      {showModal && (
        <AddMealModal onClose={() => setShowModal(false)} onAdd={addMeal} />
      )}

      {detailMeal && (
        <MealDetailModal
          meal={detailMeal}
          onClose={() => setDetailMeal(null)}
          onSave={saveMeal}
        />
      )}
    </div>
  );
}
