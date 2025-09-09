import { useEffect, useState } from 'react';

const themes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter'
];

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                🎨
                <span className="hidden sm:inline capitalize">{currentTheme}</span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-2xl border border-base-300 max-h-96 overflow-y-auto">
                {themes.map((theme) => (
                    <li key={theme}>
                        <button
                            className={`${currentTheme === theme ? 'active' : ''}`}
                            onClick={() => changeTheme(theme)}
                        >
                            <span className="capitalize">{theme}</span>
                            {currentTheme === theme && <span className="text-primary">✓</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
