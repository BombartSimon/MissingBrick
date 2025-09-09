import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import SetsPage from './pages/sets'
import SetDetailsPage from './pages/sets/$id'
import ThemeSwitcher from './components/ThemeSwitcher'

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <nav className="navbar bg-base-200 border-b border-base-300">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            🧱 MissingBrick
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/sets">My Sets</Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end">
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={
            <div className="hero min-h-[80vh]">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <div className="text-6xl mb-6">🧱</div>
                  <h1 className="text-4xl font-bold mb-4">
                    MissingBrick
                  </h1>
                  <p className="text-lg mb-8">
                    Manage your LEGO collection and track missing parts efficiently.
                    Simple tools to keep your building experience smooth.
                  </p>
                  <Link
                    to="/sets"
                    className="btn btn-primary btn-lg"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/sets" element={<SetsPage />} />
          <Route path="/sets/:id" element={<SetDetailsPage />} />
          <Route path="*" element={
            <div className="hero min-h-[50vh]">
              <div className="hero-content text-center">
                <div>
                  <div className="text-4xl mb-4">404</div>
                  <h2 className="text-2xl font-bold mb-4">Page not found</h2>
                  <p className="mb-6">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="btn btn-primary">
                    Go Home
                  </Link>
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
