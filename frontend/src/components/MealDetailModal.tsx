import { useState, useRef } from 'react';
import { ALL_TAGS, type Meal, type Unit } from '../data/mockMeals';
import { API_BASE } from '../config';

const UNITS: Unit[] = ['lbs', 'oz', 'cups', 'tbsp', 'tsp', 'items', 'cloves', 'cans'];

interface IngredientRow {
  name: string;
  quantity: string;
  unit: Unit;
}

interface Props {
  meal: Meal;
  onClose: () => void;
  onSave: (updated: Meal) => void;
  onDelete: (id: string) => void;
}

function toRows(meal: Meal): IngredientRow[] {
  return meal.ingredients.map(i => ({ name: i.name, quantity: String(i.quantity), unit: i.unit }));
}

export default function MealDetailModal({ meal, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(meal.name);
  const [tags, setTags] = useState<string[]>(meal.tags);
  const [rows, setRows] = useState<IngredientRow[]>(toRows(meal));
  const [instructions, setInstructions] = useState(meal.instructions ?? '');
  const [url, setUrl] = useState(meal.url ?? '');
  const [prepTime, setPrepTime] = useState(meal.prep_time_minutes ? String(meal.prep_time_minutes) : '');
  const [rating, setRating] = useState<number | undefined>(meal.rating);
  const [imagePath, setImagePath] = useState<string | undefined>(meal.image_path);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function updateRow(i: number, field: keyof IngredientRow, value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, { name: '', quantity: '', unit: 'items' }]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleStarClick(star: number) {
    setRating(prev => prev === star ? undefined : star);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_BASE}/api/meals/${meal.id}/image`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImagePath(data.image_path);
    } catch {
      setError('Image upload failed. Check that the backend is running.');
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImagePath(undefined);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Meal name is required.'); return; }
    const validRows = rows.filter(r => r.name.trim());
    if (validRows.length === 0) { setError('Add at least one ingredient.'); return; }

    onSave({
      ...meal,
      name: name.trim(),
      tags,
      ingredients: validRows.map(r => ({
        name: r.name.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unit: r.unit,
      })),
      instructions: instructions.trim() || undefined,
      url: url.trim() || undefined,
      prep_time_minutes: prepTime ? parseInt(prepTime, 10) : undefined,
      rating,
      image_path: imagePath,
    });
    onClose();
  }

  const imageUrl = imagePath ? `${API_BASE}/uploads/${imagePath}` : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
        {imageUrl && (
          <img src={imageUrl} alt={name} className="modal-image" />
        )}

        <form onSubmit={handleSave}>
          <div className="modal-header">
            <input
              className="modal-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Meal name"
            />
            <button type="button" className="btn-close" onClick={onClose}>✕</button>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button" onClick={() => handleStarClick(star)}>
                {rating && star <= rating ? '★' : '☆'}
              </button>
            ))}
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

          <div className="detail-row-fields">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prep Time (min)</label>
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label>Image</label>
            <div className="image-upload-row">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {imagePath && (
                <button type="button" className="btn-remove-row" onClick={removeImage}>Remove</button>
              )}
            </div>
            {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Uploading…</div>}
          </div>

          <div className="section-label" style={{ marginTop: '1.1rem' }}>Ingredients</div>
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
              <select value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {rows.length > 1 && (
                <button type="button" className="btn-remove-row" onClick={() => removeRow(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-row" onClick={addRow}>+ Add ingredient</button>

          <div className="section-label" style={{ marginTop: '1.1rem' }}>Instructions</div>
          <textarea
            rows={4}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="How to prepare this meal…"
          />

          <div className="modal-footer">
            <button type="button" className="btn-delete" onClick={() => onDelete(meal.id)}>Delete</button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
