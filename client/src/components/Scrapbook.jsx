import { useMemo, useState } from 'react'
import pinkStar from '../assets/outer3.png'
import greenStar from '../assets/outer1.png'
import wordmark from '../assets/sipori-wordmark.png'
import decor11 from '../assets/scrapbook-11.png'
import decor12 from '../assets/scrapbook-12.png'
import decor13 from '../assets/scrapbook-13.png'
import decor14 from '../assets/scrapbook-14.png'
import decor15 from '../assets/scrapbook-15.png'
import { selectMonthlyPhotos } from '../scrapbook.mjs'

const placements = [
  [14, 5, 11, -10], [26, 13, 21, 13], [53, 19, 13, -1],
  [67, 6, 14, 8], [82, 48, 12, 0], [64, 40, 18, -11],
  [52, 60, 14, 8], [32, 60, 13, -3], [6, 58, 19, 5], [21, 39, 11, 0],
]

export default function Scrapbook({ drinks, status, error, onRetry }) {
  const today = new Date()
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [shuffle, setShuffle] = useState(0)
  const photos = useMemo(() => selectMonthlyPhotos(drinks, month), [drinks, month, shuffle])
  const title = new Date(`${month}-01T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return <main className={`scrapbook${photos.length ? ' scrapbook-has-photos' : ''}`} aria-label="Monthly drink scrapbook">
    <div className="scrapbook-toolbar">
      <h1 className="sr-only">Drink scrapbook</h1>
      <time className="scrapbook-month" dateTime={month}>{title}</time>
      <button type="button" className="scrapbook-shuffle" disabled={photos.length < 2} onClick={() => setShuffle((value) => value + 1)}>shuffle photos</button>
    </div>
    <div className="scrapbook-canvas">
      <section className="scrapbook-page" aria-label={`${title} photos`}>
        <div className="scrapbook-decorations" aria-hidden="true">
          <img className="scrapbook-star scrapbook-star-pink" src={pinkStar} alt="" />
          <img className="scrapbook-star scrapbook-star-green" src={greenStar} alt="" />
          <img className="scrapbook-sticker scrapbook-leaves" src={decor12} alt="" />
          <img className="scrapbook-sticker scrapbook-sketch" src={decor15} alt="" />
          <img className="scrapbook-sticker scrapbook-doily" src={decor14} alt="" />
          <img className="scrapbook-sticker scrapbook-lotus" src={decor11} alt="" />
          <img className="scrapbook-sticker scrapbook-butterfly" src={decor13} alt="" />
        </div>
        <img className="scrapbook-wordmark" src={wordmark} alt="Sipori" />
        {status === 'loading' && <p className="scrapbook-message" role="status">Gathering your sips…</p>}
        {status === 'error' && <div className="scrapbook-message" role="alert"><p>Could not load your photos. {error?.message}</p><button onClick={onRetry}>Try again</button></div>}
        {status === 'ready' && photos.length === 0 && <div className="scrapbook-message scrapbook-empty"><h2>A fresh page for {title}</h2><p>Add a photo to a drink logged this month to start your scrapbook.</p><a href="#/">Visit your cafés</a></div>}
        {status === 'ready' && photos.map((drink, index) => {
          const [x, y, width, rotation] = placements[index]
          return <figure key={drink.id} className={`scrapbook-photo scrapbook-photo-${index}`} style={{ '--photo-x': `${x}%`, '--photo-y': `${y}%`, '--photo-width': `${width}%`, '--photo-rotation': `${rotation}deg` }}>
            <img src={drink.photoUrl} alt={drink.name} onError={(event) => { event.currentTarget.style.opacity = '0'; event.currentTarget.parentElement.dataset.failed = 'true' }} />
            <figcaption>{drink.name}</figcaption>
          </figure>
        })}
      </section>
    </div>
  </main>
}
