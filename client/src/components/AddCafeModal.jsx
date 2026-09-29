import { useEffect, useRef, useState } from 'react'
import outerStar from '../assets/outer2.png'
import innerStar from '../assets/inner 2.png'

export default function AddCafeModal({ onClose, onSave, cafe = null, initialDrink = null }) {
  const dialog = useRef(null)
  const fileInput = useRef(null)
  const [name, setName] = useState(cafe?.name || '')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [closing, setClosing] = useState(false)
  const [step, setStep] = useState(cafe ? 'drink' : 'cafe')
  const [changingStep, setChangingStep] = useState(false)
  const saving = useRef(false)
  const drinkHeading = useRef(null)
  const [drink, setDrink] = useState(initialDrink || { date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10), type: 'hojicha', name: '', price: '', rating: null, reorder: true, notes: '', photoUrl: '' })
  useEffect(() => { if (step === 'drink') drinkHeading.current?.focus() }, [step])
  function updateDrink(key, value) { setDrink((current) => ({ ...current, [key]: value })) }

  useEffect(() => {
    if (!changingStep || closing) return
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    const timer = window.setTimeout(() => {
      setStep('drink')
      setChangingStep(false)
    }, duration)
    return () => window.clearTimeout(timer)
  }, [changingStep, closing])

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    if (!closing) return
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220
    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [closing, onClose])

  function closeModal() {
    if (!busy) setClosing(true)
  }

  async function selectImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.')
      return
    }
    setBusy(true)
    try {
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height))
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      const imageUrl = canvas.toDataURL('image/webp', .8)
      if (step === 'drink') updateDrink('photoUrl', imageUrl)
      else setPhotoUrl(imageUrl)
    } catch {
      setError('This image could not be opened. Please choose another.')
    } finally { setBusy(false) }
  }

  async function submit(event) {
    event.preventDefault()
    if (busy || closing || changingStep || saving.current) return
    if (!name.trim()) { setError('Enter a cafe name.'); return }
    setError('')
    if (step === 'cafe') { setChangingStep(true); return }
    if (!drink.name.trim()) { setError('Enter a drink name.'); return }
    saving.current = true
    setBusy(true)
    try {
      await onSave({ cafe: { name: name.trim(), photoUrl }, drink: { ...drink, price: Number(drink.price) } })
      setClosing(true)
    } catch (caught) { setError(caught.message || 'Could not save. Please try again.') }
    finally { saving.current = false; setBusy(false) }
  }

  return (
    <dialog ref={dialog} className={`add-cafe-modal${step === 'drink' ? ' drink-step' : ''}${closing ? ' is-closing' : ''}`} aria-labelledby="add-cafe-title"
      onCancel={(event) => { event.preventDefault(); closeModal() }}>
      {step === 'drink' ? (
        <div className="drink-scene">
          <form className="add-drink-form" onSubmit={submit} aria-busy={busy}>
            <header className="drink-form-heading">
              <h2 id="add-cafe-title" ref={drinkHeading} tabIndex={-1}>{initialDrink ? 'edit drink' : 'add drink'}</h2>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={selectImage} />
              <button type="button" className="drink-image-button" disabled={busy || closing} onClick={() => fileInput.current.click()}>
                {drink.photoUrl ? <img src={drink.photoUrl} alt="Drink preview" /> : <span aria-hidden="true">+</span>}
                {drink.photoUrl ? 'Change Image' : 'Add Image'}
              </button>
            </header>
            <fieldset className="drink-fields" disabled={busy || closing}>
              <label htmlFor="drink-date">Date:</label>
              <input id="drink-date" type="date" value={drink.date} required onChange={(event) => updateDrink('date', event.target.value)} />
              <span id="drink-type-label">Type:</span>
              <div className="drink-choices" role="group" aria-labelledby="drink-type-label">
                {['matcha', 'hojicha'].map((type) => <button type="button" key={type} aria-pressed={drink.type === type} onClick={() => updateDrink('type', type)}>{type}</button>)}
              </div>
              <label htmlFor="drink-name">Name:</label>
              <input id="drink-name" value={drink.name} required maxLength={120} onChange={(event) => updateDrink('name', event.target.value)} />
              <span id="drink-rating-label">Rating:</span>
              <div className="drink-rating-field">
                <div className="drink-rating-stars" role="group" aria-labelledby="drink-rating-label">
                  {[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating}
                    aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`} aria-pressed={drink.rating === rating}
                    onClick={() => updateDrink('rating', rating)}>
                    <span aria-hidden="true">{rating <= (drink.rating || 0) ? '★' : '☆'}</span>
                  </button>)}
                </div>
              </div>
              <label htmlFor="drink-price">Price:</label>
              <input id="drink-price" type="number" min="0" max="99999999.99" step="0.01" inputMode="decimal" value={drink.price} required onChange={(event) => updateDrink('price', event.target.value)} />
              <span id="drink-reorder-label">Reorder:</span>
              <div className="drink-choices" role="group" aria-labelledby="drink-reorder-label">
                {[true, false].map((value) => <button type="button" key={String(value)} aria-pressed={drink.reorder === value} onClick={() => updateDrink('reorder', value)}>{value ? 'yes' : 'no'}</button>)}
              </div>
              <label htmlFor="drink-notes">Notes:</label>
              <textarea id="drink-notes" rows={3} maxLength={2000} value={drink.notes} onChange={(event) => updateDrink('notes', event.target.value)} />
            </fieldset>
            {error && <p className="cafe-form-error" role="alert">{error}</p>}
            <div className="cafe-form-actions">
              <button type="button" className="cafe-cancel" disabled={busy || closing} onClick={closeModal}>discard</button>
              <button type="submit" className="cafe-next" disabled={busy || closing}>{busy ? 'saving...' : 'save'}</button>
            </div>
          </form>
        </div>
      ) : <div className={`add-cafe-scene${changingStep ? ' is-leaving' : ''}`} inert={changingStep ? '' : undefined}>
        <img className="modal-star modal-star-outer" src={outerStar} alt="" />
        <img className="modal-star modal-star-inner" src={innerStar} alt="" />
        <form className="add-cafe-form" onSubmit={submit}>
          <h2 id="add-cafe-title">add café</h2>
          <input id="cafe-name" className="cafe-name-input" value={name}
            onChange={(event) => setName(event.target.value)} maxLength={120} required autoFocus autoComplete="off" />
          <label htmlFor="cafe-name">Café name:</label>
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={selectImage} />
          <button className="add-image-button" type="button" disabled={busy} onClick={() => fileInput.current.click()}>
            {photoUrl && <img src={photoUrl} alt="Selected café preview" />}
            <span aria-hidden="true">+</span> {photoUrl ? 'Change Image' : 'Add Image'}
          </button>
          {error && <p className="cafe-form-error" role="alert">{error}</p>}
          <div className="cafe-form-actions">
            <button type="button" className="cafe-cancel" disabled={busy} onClick={closeModal}>cancel</button>
            <button type="submit" className="cafe-next" disabled={busy}>{busy ? 'please wait...' : 'next'}</button>
          </div>
        </form>
      </div>}
    </dialog>
  )
}
