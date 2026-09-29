import { useState } from 'react'
import AddCafeModal from './AddCafeModal.jsx'

export default function DrinkDetail({ drink, cafe, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setBusy(true)
    setError('')
    try { await onDelete(drink.id) }
    catch (caught) { setError(caught.message); setBusy(false) }
  }

  return <>
    <article className="drink-detail-card" aria-labelledby="drink-detail-title">
      <header className="drink-detail-title-row">
        <h2 id="drink-detail-title" tabIndex={-1}>{drink.name}</h2>
        <div className="drink-detail-actions">
          <button type="button" className="drink-delete" onClick={() => setConfirming(true)}>delete</button>
          <button type="button" onClick={() => setEditing(true)}>edit</button>
        </div>
      </header>
      <div className="drink-detail-columns">
        <dl>
          <div><dt>Rating:</dt><dd className="drink-detail-rating" aria-label={Number.isFinite(drink.rating) ? `${drink.rating} out of 5 stars` : 'Not rated yet'}>{Number.isFinite(drink.rating) ? '★'.repeat(Math.max(0, Math.min(5, Math.round(drink.rating)))) : 'Not rated yet'}</dd></div>
          <div><dt>Type:</dt><dd className="drink-detail-type">{drink.type}</dd></div>
          <div><dt>Price:</dt><dd>{Number(drink.price).toFixed(2)}</dd></div>
          <div><dt>Reorder:</dt><dd>{drink.reorder ? 'Yes' : 'No'}</dd></div>
        </dl>
        <dl>
          <div><dt>Date:</dt><dd>{drink.date.split('-').reverse().join(' / ')}</dd></div>
          <div><dt>Notes:</dt><dd className="drink-detail-notes">{drink.notes || 'No notes yet.'}</dd></div>
        </dl>
      </div>
      {confirming && <div className="drink-delete-confirm" role="group" aria-label="Confirm deletion">
        <p>Delete this drink?</p>
        <button type="button" disabled={busy} onClick={() => setConfirming(false)}>keep drink</button>
        <button type="button" disabled={busy} onClick={remove}>{busy ? 'deleting…' : 'delete drink'}</button>
      </div>}
      {error && <p role="alert">{error}</p>}
    </article>
    {editing && <AddCafeModal cafe={cafe} initialDrink={drink} onClose={() => setEditing(false)} onSave={({ drink: draft }) => onUpdate(drink.id, draft)} />}
  </>
}
