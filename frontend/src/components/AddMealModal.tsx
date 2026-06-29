import { useState } from 'react';
import { ALL_TAGS, type Meal, type Unit } from '../data/mockMeals';

const UNITS: Unit[] = ['lbs', 'oz', 'cups', 'tbsp', 'tsp', 'items', 'cloves', 'cans'];

interface IngredientRow {
  name: string;
  quantity: string;
  unit: Unit;
}

interface Props {
  onClose: () => void;
  onAdd: (meal: Meal) => void;
}

function blankRow(): IngredientRow {
  return { name: '', quantity: '', unit: 'items' };
}

export default function AddMealModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rows, setRows] = useState<IngredientRow[]>([blankRow()]);
  const [error, setError] = useState('');

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function updateRow(i: number, field: keyof IngredientRow, value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, blankRow()]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Meal name is required.'); return; }
    const validRows = rows.filter(r => r.name.trim());
    if (validRows.length === 0) { setError('Add at least one ingredient.'); return; }

    const meal: Meal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      tags,
      ingredients: validRows.map(r => ({
        name: r.name.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unit: r.unit,
      })),
    };
    onAdd(meal);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add New Meal</span>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meal Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Grilled Salmon"
              autoFocus
            />
          </div>

          <div className="section-label">Tags</div>
          <div className="tags-grid">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-toggle${tags.includes(tag) ? ' active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: '1.25rem' }}>Ingredients</div>
          {rows.map((row, i) => (
            <div key={i} className="ingredient-row">
              <input
                type="text"
                placeholder="Ingredient"
                value={row.name}
                onChange={e => updateRow(i, 'name', e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty"
                min="0"
                step="0.25"
                value={row.quantity}
                onChange={e => updateRow(i, 'quantity', e.target.value)}
              />
              <select
                value={row.unit}
                onChange={e => updateRow(i, 'unit', e.target.value)}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {rows.length > 1 && (
                <button type="button" className="btn-remove-row" onClick={() => removeRow(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-row" onClick={addRow}>
            + Add ingredient
          </button>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Add Meal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
