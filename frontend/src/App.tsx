import { Routes, Route, Link } from 'react-router-dom'
import ApiTest from './components/ApiTest'
import './App.css'
import SetsPage from './pages/sets'

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <header className="bg-base-200 p-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-base-content">MissingBrick - LEGO Set Tracker</h1>
          <p className="text-base-content/70 mt-2">Track your LEGO sets and missing parts</p>

          <nav className="mt-4 flex gap-4 justify-center">
            <Link
              to="/"
              className="btn btn-primary"
            >
              Home
            </Link>
            <Link
              to="/sets"
              className="btn btn-secondary"
            >
              Sets
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              <ApiTest />
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Welcome to MissingBrick</h2>
                  <p>Your LEGO collection management tool</p>

                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3">Available Features</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Manage LEGO sets</li>
                      <li>Track missing parts</li>
                      <li>Sync with Rebrickable API</li>
                      <li>View collection statistics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          } />

          <Route path="/sets" element={<SetsPage />} />

          {/* Fallback route */}
          <Route path="*" element={
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <h2 className="card-title justify-center">Page not found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <div className="card-actions justify-center">
                  <Link to="/" className="btn btn-primary">Go back home</Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
