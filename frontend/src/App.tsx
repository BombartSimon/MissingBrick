import { Routes, Route, Link } from 'react-router-dom'
import ApiTest from './components/ApiTest'
import './App.css'
import SetsPage from './pages/sets'

function App() {
  return (
    <>
      <header>
        <h1>MissingBrick - LEGO Set Tracker</h1>
        <p>Track your LEGO sets and missing parts</p>

        <nav style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1rem'
        }}>
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '0.375rem'
            }}
          >
            Home
          </Link>
          <Link
            to="/sets"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '0.375rem'
            }}
          >
            Sets
          </Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={
            <div>
              <ApiTest />
              <div>
                <h2>Welcome to MissingBrick</h2>
                <p>Your LEGO collection management tool</p>

                <div className="features">
                  <h3>Available Features</h3>
                  <ul>
                    <li>Manage LEGO sets</li>
                    <li>Track missing parts</li>
                    <li>Sync with Rebrickable API</li>
                    <li>View collection statistics</li>
                  </ul>
                </div>
              </div>
            </div>
          } />

          <Route path="/sets" element={<SetsPage />} />

          {/* Fallback route */}
          <Route path="*" element={
            <div style={{ padding: '2rem' }}>
              <h2>Page not found</h2>
              <p>The page you're looking for doesn't exist.</p>
              <Link to="/">Go back home</Link>
            </div>
          } />
        </Routes>
      </main>
    </>
  )
}

export default App
