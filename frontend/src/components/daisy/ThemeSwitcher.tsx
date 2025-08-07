const DAISY_THEMES = [
    "dark",
    "light",
    "coffee",
    "dracula",
    "lofi",
    "bumblebee",
    "corporate",
    "aqua",
    "winter",
    "dim",
    "halloween",
    "night",
];

const ThemeSwitcher = () => {

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Theme
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </label>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                {DAISY_THEMES.map(theme => (
                    <li key={theme}>
                        <button
                            onClick={() => {
                                document.documentElement.setAttribute("data-theme", theme);
                            }}
                            className={`${document.documentElement.getAttribute("data-theme") === theme ? "active" : ""}`}
                        >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                    </li>
                ))}
            </div>
        </div>
    );
};

export default ThemeSwitcher;