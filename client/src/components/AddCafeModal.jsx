import { useEffect, useRef, useState } from 'react'
import outerStar from '../assets/outer2.png'
import innerStar from '../assets/inner 2.png'

export default function AddCafeModal({ onClose }) {
  const dialog = useRef(null)
  const fileInput = useRef(null)
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [closing, setClosing] = useState(false)

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
      setPhotoUrl(canvas.toDataURL('image/webp', .8))
    } catch {
      setError('This image could not be opened. Please choose another.')
    } finally { setBusy(false) }
  }

  function submit(event) {
    event.preventDefault()
    setError(name.trim() ? '' : 'Enter a café name.')
    // The next step will be connected once its flow is defined.
  }

  return (
    <dialog ref={dialog} className={`add-cafe-modal${closing ? ' is-closing' : ''}`} aria-labelledby="add-cafe-title"
      onCancel={(event) => { event.preventDefault(); closeModal() }}>
      <div className="add-cafe-scene">
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
      </div>
    </dialog>
  )
}
