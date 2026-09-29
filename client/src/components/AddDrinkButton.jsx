import { useEffect, useRef, useState } from 'react'
import outerStar from '../assets/outer3.png'
import innerStar from '../assets/inner3.png'
import phoneOuterStar from '../assets/outer5.png'
import phoneInnerStar from '../assets/inner5.png'
import usePhoneView from '../usePhoneView.js'

export default function AddDrinkButton({ onClick, disabled }) {
  const phone = usePhoneView()
  const outer = phone ? phoneOuterStar : outerStar
  const inner = phone ? phoneInnerStar : innerStar
  const artwork = useRef(null)
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
    image.src = outer
    return () => { cancelled = true; pixels.current = null }
  }, [outer])

  function hitsStar(event) {
    const source = pixels.current
    const bounds = artwork.current?.getBoundingClientRect()
    if (!source || !bounds?.width || !bounds.height) return false
    const x = Math.floor((event.clientX - bounds.left) / bounds.width * source.width)
    const y = Math.floor((event.clientY - bounds.top) / bounds.height * source.height)
    return x >= 0 && y >= 0 && x < source.width && y < source.height && source.data[(y * source.width + x) * 4 + 3] > 16
  }

  function checkStar(event) {
    if (event.pointerType !== 'touch') setOverStar(hitsStar(event))
  }

  return <button className={`add-drink-star${overStar ? ' is-over-star' : ''}`} type="button" disabled={disabled}
    onPointerEnter={checkStar} onPointerMove={checkStar}
    onPointerLeave={() => setOverStar(false)} onPointerCancel={() => setOverStar(false)}
    onClick={(event) => { if (event.detail === 0 || hitsStar(event)) onClick() }}>
    <img ref={artwork} className="drink-star-outer" src={outer} alt="" />
    <img className="drink-star-inner" src={inner} alt="" />
    <span><b aria-hidden="true">+</b>add drink</span>
  </button>
}
