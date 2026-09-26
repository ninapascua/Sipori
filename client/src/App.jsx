import { useEffect, useMemo, useState } from 'react'
import { listCafes, listDrinks } from './api'
import DemoNotice from './components/DemoNotice.jsx'
import AddShopButton from './components/AddShopButton.jsx'
import AddCafeModal from './components/AddCafeModal.jsx'
import siporiMark from './assets/sipori-mark.png'
import siporiWordmark from './assets/sipori-wordmark.png'

// A deliberately small working app. Replace all of it with your own project.
//
// What is worth keeping is the SHAPE: four states rather than two, a loading
// message that admits a free-tier server can be slow to wake, and errors that
// say something rather than rendering an empty list.

export default function App() {
  const [status, setStatus] = useState('loading')
  const [cafes, setCafes] = useState([])
  const [drinks, setDrinks] = useState([])
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [addingCafe, setAddingCafe] = useState(false)

  async function load() {
    setStatus('loading')
    setError(null)

    const timer = setTimeout(() => setSlow(true), 3000)

    try {
      const [cafeData, drinkData] = await Promise.all([
        listCafes(),
        listDrinks(),
      ])

      setCafes(cafeData)
      setDrinks(drinkData)
      setStatus('ready')
    } catch (caught) {
      setError(caught)
      setStatus('error')
    } finally {
      clearTimeout(timer)
      setSlow(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredCafes = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return cafes
    }

    return cafes.filter((cafe) =>
      cafe.name.toLowerCase().includes(query)
    )
  }, [cafes, search])

  function getCafeDrinks(cafeId) {
    return drinks.filter((drink) => drink.cafeId === cafeId)
  }

  function getAverageRating(cafeId) {
    const cafeDrinks = getCafeDrinks(cafeId)

    if (cafeDrinks.length === 0) {
      return null
    }

    const total = cafeDrinks.reduce(
      (sum, drink) => sum + drink.rating,
      0
    )

    return (total / cafeDrinks.length).toFixed(1)
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="/" aria-label="Sipori home">
          <img className="logo-mark" src={siporiMark} alt="Sipori home" />
          <img className="logo-wordmark" src={siporiWordmark} alt="" aria-hidden="true" />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
        <nav id="main-navigation" className={`nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className="nav-link active" href="/" aria-current="page">
            Cafés
          </a>
          <a className="nav-link" href="#scrapbook">
            Scrapbook
          </a>
        </nav>
      </header>

      <DemoNotice />

      <main className="main-content">
        <section className="page-heading">
          <h1>Cafés</h1>

          <label className="search">
            <span className="sr-only">Search cafés</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>

        {error && (
          <div className="error" role="alert">
            <p>We couldn't load your cafés. {error.message}</p>
            <button type="button" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {status === 'loading' && (
          <p className="status-message">
            {slow
              ? 'Still loading. The server may be waking up...'
              : 'Loading cafés...'}
          </p>
        )}

        {status === 'ready' && cafes.length === 0 && (
          <p className="status-message">
            No cafés logged yet. Add your first café.
          </p>
        )}

        {status === 'ready' && cafes.length > 0 && (
          <>
            <div className="cafe-scroll" role="region" aria-label="Caf?s" tabIndex={0}>
            <div className="cafe-grid">
              {filteredCafes.map((cafe) => {
                const cafeDrinks = getCafeDrinks(cafe.id)
                const averageRating = getAverageRating(cafe.id)

                return (
                  <article className="cafe-card" key={cafe.id}>
                    <div className="cafe-card-image">
                      <h2>{cafe.name}</h2>
                    </div>

                    <div className="cafe-card-content">
                      <p>
                        drinks logged: {cafeDrinks.length}
                      </p>

                      <p className="rating">
                        {averageRating
                          ? `ave. rating: ${'★'.repeat(Math.round(Number(averageRating)))}`
                          : 'No ratings yet'}
                      </p>
                    </div>
                  </article>
                )
              })}

            </div>
            </div>

            {filteredCafes.length === 0 && (
              <p className="status-message">
                No cafés match "{search}".
              </p>
            )}
          </>
        )}
        <AddShopButton onClick={() => setAddingCafe(true)} />
      </main>

      {addingCafe && <AddCafeModal onClose={() => setAddingCafe(false)} />}
      <footer className="site-footer">
        <span><img src={siporiWordmark} alt="Sipori" /></span>
      </footer>
    </div>
  )
}
