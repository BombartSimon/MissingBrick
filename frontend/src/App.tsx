import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import SetsPage from './pages/sets'
import SetDetailsPage from './pages/sets/$id'
import ThemeSwitcher from './components/daisy/ThemeSwitcher'

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <header className="bg-base-200 shadow-md">
        <div className="navbar max-w-6xl mx-auto px-4">
          <div className="navbar-start">
            <div className="hidden md:flex">
              <Link to="/" className="text-2xl font-bold text-primary">
                MissingBrick
              </Link>
            </div>
            <div className="dropdown md:hidden">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/sets">Sets</Link></li>
              </ul>
            </div>
          </div>
          <div className="navbar-center">
            <div className="hidden md:flex">
              <ul className="menu menu-horizontal px-1">
                <li><Link to="/" className="btn btn-ghost">Home</Link></li>
                <li><Link to="/sets" className="btn btn-ghost">Sets</Link></li>
              </ul>
            </div>
          </div>
          <div className="navbar-end">
            <ThemeSwitcher />
          </div>
        </div>
        <div className="text-center py-4 bg-base-300/30">
          <h1 className="text-3xl font-bold text-base-content">LEGO Set Tracker</h1>
          <p className="text-base-content/70 mt-1">Track your LEGO sets and missing parts</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              {/* <ApiTest /> */}
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
          <Route path="/sets/:id" element={<SetDetailsPage />} />

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
