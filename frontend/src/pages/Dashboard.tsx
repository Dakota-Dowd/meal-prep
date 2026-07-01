import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MealCard from '../components/MealCard';
import ShoppingList from '../components/ShoppingList';
import AddMealModal from '../components/AddMealModal';
import MealDetailModal from '../components/MealDetailModal';
import { ALL_TAGS, type Meal } from '../data/mockMeals';
import { API_BASE, getAuthHeaders } from '../config';

const STORAGE_SELECTED = 'mp_selected';

function loadSelected(): string[] {
  const saved = localStorage.getItem(STORAGE_SELECTED);
  return saved ? JSON.parse(saved) : [];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('mp_auth') || 'null');

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(loadSelected);
  const [stagedIds, setStagedIds] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/meals`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setMeals(data))
      .catch(err => console.error('Failed to load meals:', err))
      .finally(() => setLoading(false));
  }, []);

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

  async function addMeal(meal: Meal) {
    try {
      const res = await fetch(`${API_BASE}/api/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(meal),
      });
      const saved = await res.json();
      setMeals(prev => [...prev, saved]);
    } catch (err) {
      console.error('Failed to add meal:', err);
    }
  }

  async function saveMeal(updated: Meal) {
    try {
      const res = await fetch(`${API_BASE}/api/meals/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(updated),
      });
      const saved = await res.json();
      setMeals(prev => prev.map(m => m.id === saved.id ? saved : m));
    } catch (err) {
      console.error('Failed to save meal:', err);
    }
  }

  async function deleteMeal(id: string) {
    try {
      await fetch(`${API_BASE}/api/meals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setMeals(prev => prev.filter(m => m.id !== id));
      setSelectedIds(prev => {
        const next = prev.filter(x => x !== id);
        localStorage.setItem(STORAGE_SELECTED, JSON.stringify(next));
        return next;
      });
      setStagedIds(prev => prev.filter(x => x !== id));
      setDetailMeal(null);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
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
              {loading ? 'Loading…' : `${displayed.length} meal${displayed.length !== 1 ? 's' : ''}`}
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

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading meals…</div>
          ) : (
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
          )}
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
          onDelete={deleteMeal}
        />
      )}
    </div>
  );
}
