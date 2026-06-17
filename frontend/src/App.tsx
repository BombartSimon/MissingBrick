import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Boxes, ClipboardList, Home, PackageSearch } from 'lucide-react';
import './App.css';
import SetsPage from './pages/sets';
import SetDetailsPage from './pages/sets/$id';
import ShoppingListPage from './pages/shopping-list';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Button, EmptyState } from './components/ui';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${isActive
    ? 'bg-slate-950 text-white dark:bg-white dark:text-neutral-950'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
  }`;

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/sets" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400 text-slate-950 shadow-sm"><Boxes className="h-4 w-4" /></span>
            <span>MissingBrick</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 sm:flex">
            <NavLink to="/sets" className={navLinkClass}><PackageSearch className="h-4 w-4" />Sets</NavLink>
            <NavLink to="/shopping-list" className={navLinkClass}><ClipboardList className="h-4 w-4" />Shopping List</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <nav className="flex items-center gap-1 sm:hidden">
              <NavLink to="/sets" className={navLinkClass} aria-label="Sets"><PackageSearch className="h-4 w-4" /></NavLink>
              <NavLink to="/shopping-list" className={navLinkClass} aria-label="Shopping List"><ClipboardList className="h-4 w-4" /></NavLink>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="grid min-h-[70vh] place-items-center">
              <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <EmptyState
                  icon={<Boxes className="h-6 w-6" />}
                  title="MissingBrick"
                  description="A focused inventory workbench for tracking LEGO sets, missing parts, and shopping lists."
                />
                <div className="flex justify-center gap-2">
                  <Link to="/sets"><Button variant="primary"><PackageSearch className="h-4 w-4" />Open Sets</Button></Link>
                  <Link to="/shopping-list"><Button><ClipboardList className="h-4 w-4" />Shopping List</Button></Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/sets" element={<SetsPage />} />
          <Route path="/sets/:id" element={<SetDetailsPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="*" element={
            <EmptyState
              icon={<Home className="h-6 w-6" />}
              title="Page not found"
              description="The page you are looking for does not exist."
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
