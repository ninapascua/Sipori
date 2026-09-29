import { useEffect, useRef, useState } from 'react'
import outerStar from '../assets/outer1.png'
import phoneOuterStar from '../assets/outer4.png'
import usePhoneView from '../usePhoneView.js'

export default function AddShopButton({ onClick }) {
  const star = usePhoneView() ? phoneOuterStar : outerStar
  const pixels = useRef(null)
  const [overStar, setOverStar] = useState(false)

  useEffect(() => {
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0)
      pixels.current = context.getImageData(0, 0, canvas.width, canvas.height)
    }
    image.src = star
    return () => { cancelled = true; pixels.current = null }
  }, [star])

  function checkStar(event) {
    const source = pixels.current
    if (!source || event.pointerType === 'touch') return

    // Match the decorative layer's responsive bounds and background-size: contain.
    const button = event.currentTarget
    const bounds = button.getBoundingClientRect()
    const layer = getComputedStyle(button, '::before')
    const width = parseFloat(layer.width)
    const height = parseFloat(layer.height)
    const scale = Math.min(width / source.width, height / source.height)
    if (!Number.isFinite(scale) || scale <= 0) return
    const left = bounds.left + button.clientLeft + parseFloat(layer.left)
    const top = bounds.top + button.clientTop + parseFloat(layer.top)
    const x = Math.floor((event.clientX - left - (width - source.width * scale) / 2) / scale)
    const y = Math.floor((event.clientY - top - (height - source.height * scale) / 2) / scale)
    const inside = x >= 0 && y >= 0 && x < source.width && y < source.height
    setOverStar(inside && source.data[(y * source.width + x) * 4 + 3] > 16)
  }

  return (
    <button
      className={`add-cafe-card${overStar ? ' is-over-star' : ''}`}
      type="button"
      onClick={onClick}
      onPointerEnter={checkStar}
      onPointerMove={checkStar}
      onPointerLeave={() => setOverStar(false)}
      onPointerCancel={() => setOverStar(false)}
    >
      <span className="add-icon" aria-hidden="true">+</span>
      <span>Add shop</span>
    </button>
  )
}
