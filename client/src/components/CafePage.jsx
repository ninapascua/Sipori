import { useState } from 'react'
import AddDrinkButton from './AddDrinkButton.jsx'

export default function CafePage({ cafe, drinks, status, error, onRetry, onAddDrink }) {
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const filtered = drinks.filter((drink) => (type === 'all' || drink.type === type) && drink.name.toLowerCase().includes(search.trim().toLowerCase()))

  return <main className="cafe-detail">
    <AddDrinkButton onClick={onAddDrink} disabled={!cafe || status !== 'ready'} />
    <section className="cafe-detail-panel" aria-labelledby="cafe-detail-title">
      <header className="cafe-detail-heading">
        <a className="cafe-back" href="#/" aria-label="Back to cafes">
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 12H4m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <h1 id="cafe-detail-title">{cafe?.name || 'café'}</h1>
        <div className="drink-filters" role="group" aria-label="Filter drinks by type">
          {['all', 'matcha', 'hojicha'].map((item) => <button key={item} type="button" aria-pressed={type === item} onClick={() => setType(item)}>{item}</button>)}
        </div>
        <label className="search cafe-drink-search"><span className="sr-only">Search drinks</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </header>
      <div className="drink-card-scroll" tabIndex={0} role="region" aria-label="Cafe drinks">
        {status === 'loading' && <p role="status">Loading café...</p>}
        {status === 'error' && <div role="alert"><p>Could not load this café. {error?.message}</p><button onClick={onRetry}>Try again</button></div>}
        {status === 'ready' && !cafe && <p>This café could not be found. <a href="#/">Back to cafés</a></p>}
        {status === 'ready' && cafe && (filtered.length ? <div className="drink-card-grid">
          {filtered.map((drink) => <article className="drink-log-card" key={drink.id}>
            <div className={`drink-log-photo ${drink.type}`}>
              {drink.photoUrl ? <img src={drink.photoUrl} alt={drink.name} onError={(event) => { event.currentTarget.hidden = true }} /> : <span>sipori<span aria-hidden="true">✧</span></span>}
            </div>
            <h2>{drink.name}</h2>
            <p className="drink-log-rating" aria-label={Number.isFinite(drink.rating) ? `${drink.rating} out of 5 stars` : 'Not rated'}>{Number.isFinite(drink.rating) ? '★'.repeat(Math.max(0, Math.min(5, Math.round(drink.rating)))) : 'not rated yet'}</p>
            <dl>
              <div><dt>Type:</dt><dd>{drink.type}</dd></div>
              <div><dt>Date:</dt><dd>{drink.date.split('-').reverse().join('/')}</dd></div>
              <div><dt>Price:</dt><dd>{Number(drink.price).toFixed(2)}</dd></div>
              <div><dt>Reorder:</dt><dd>{drink.reorder ? 'Yes' : 'No'}</dd></div>
            </dl>
            <h3>Notes</h3><p className="drink-log-notes">{drink.notes || 'No notes yet.'}</p>
          </article>)}
        </div> : <p className="drink-empty">{drinks.length ? 'No drinks match your search or filter.' : 'Your first sip belongs here. Add a drink to this café.'}</p>)}
      </div>
    </section>
  </main>
}
