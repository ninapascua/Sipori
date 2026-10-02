import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DrinkDetail from './DrinkDetail.jsx'
import SearchIcon from './SearchIcon.jsx'
import AddDrinkButton from './AddDrinkButton.jsx'

export default function CafePage({ cafe, drinks, status, error, onRetry, onAddDrink, onUpdateDrink, onDeleteDrink }) {
  const [flip, setFlip] = useState(null)
  const flipTimer = useRef(null)
  const flipBusy = useRef(false)
  const listScrollTop = useRef(0)
  const scrollRegion = useRef(null)
  useEffect(() => () => window.clearTimeout(flipTimer.current), [])

  useLayoutEffect(() => {
    if (flip?.phase === 'in') {
      scrollRegion.current?.scrollTo({ top: flip.opening ? 0 : listScrollTop.current })
    }
  }, [flip])

  function showDrink(id) {
    if (flipBusy.current) return
    const opening = id !== null
    const cardId = opening ? id : selectedId
    if (opening) listScrollTop.current = scrollRegion.current?.scrollTop || 0
    const finish = () => {
      setFlip(null)
      flipBusy.current = false
      if (opening) scrollRegion.current?.querySelector('#drink-detail-title')?.focus({ preventScroll: true })
      else {
        scrollRegion.current?.scrollTo({ top: listScrollTop.current })
        Array.from(scrollRegion.current?.querySelectorAll('.drink-card-open') || []).find((button) => button.dataset.drinkId === String(cardId))?.focus({ preventScroll: true })
      }
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSelectedId(id)
      flipTimer.current = window.setTimeout(finish, 0)
      return
    }
    flipBusy.current = true
    setFlip({ phase: 'out', opening, cardId })
    flipTimer.current = window.setTimeout(() => {
      setSelectedId(id)
      if (opening) scrollRegion.current?.scrollTo({ top: 0 })
      setFlip({ phase: 'in', opening, cardId })
      flipTimer.current = window.setTimeout(finish, 420)
    }, 280)
  }

  const [selectedId, setSelectedId] = useState(null)
  const selectedDrink = drinks.find((drink) => drink.id === selectedId)
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
          {['all', 'matcha', 'hojicha'].map((item) => <button key={item} type="button" disabled={!!flip} aria-pressed={type === item} onClick={() => { setType(item); setSelectedId(null) }}>{item}</button>)}
        </div>
        <label className="search cafe-drink-search"><SearchIcon /><span className="sr-only">Search drinks</span><input type="search" disabled={!!flip} value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(null) }} /></label>
      </header>
      <div ref={scrollRegion} className={`drink-card-scroll${flip ? ` drink-flip-${flip.phase} drink-flip-${flip.opening ? 'forward' : 'back'}` : ''}`} tabIndex={0} role="region" aria-label="Cafe drinks">
        {status === 'loading' && <p role="status">Loading café...</p>}
        {status === 'error' && <div role="alert"><p>Could not load this café. {error?.message}</p><button onClick={onRetry}>Try again</button></div>}
        {status === 'ready' && !cafe && <p>This café could not be found. <a href="#/">Back to cafés</a></p>}
        {status === 'ready' && cafe && (selectedDrink ? <DrinkDetail key={selectedDrink.id} drink={selectedDrink} cafe={cafe} isLastDrink={drinks.length === 1} onFlipBack={() => showDrink(null)} flipping={!!flip} onUpdate={onUpdateDrink} onDelete={async (id) => { await onDeleteDrink(id); setSelectedId(null) }} /> : filtered.length ? <div className="drink-card-grid">
          {filtered.map((drink) => <article className={`drink-log-card${flip?.cardId === drink.id ? ' drink-flip-target' : ''}`} key={drink.id}>
            <button type="button" className="drink-card-open" data-drink-id={drink.id} aria-label={`View ${drink.name}`} disabled={!!flip} onClick={() => showDrink(drink.id)} />
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
