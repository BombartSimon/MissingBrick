import React, { useState, useCallback, useEffect, useRef } from 'react';
import { searchSets } from '../services/api';
import type { RebrickableSet } from '../types/api';

interface SetSearchProps {
    onSelectSet: (set: RebrickableSet) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const SetSearch: React.FC<SetSearchProps> = ({
    onSelectSet,
    placeholder = "Search for LEGO sets...",
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<RebrickableSet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const debounce = <T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): ((...args: Parameters<T>) => void) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const performSearch = useCallback(async (term: string) => {
        if (term.length < 2) {
            setResults([]);
            setIsOpen(false);
            setSelectedIndex(-1);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await searchSets(term, 1, 10);
            setResults(response.results);
            setIsOpen(true);
            setSelectedIndex(-1);
        } catch (err) {
            setError('Failed to search sets');
            setResults([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    const handleSelectSet = (set: RebrickableSet) => {
        onSelectSet(set);
        setSearchTerm(set.name);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleInputFocus = () => {
        if (results.length > 0) {
            setIsOpen(true);
        }
    };

    const handleInputBlur = (e: React.FocusEvent) => {
        // Don't close if clicking inside dropdown
        if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        setTimeout(() => setIsOpen(false), 150);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelectSet(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setError(null);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="input input-bordered w-full pr-20"
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isLoading && (
                        <span className="loading loading-spinner loading-sm"></span>
                    )}
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="btn btn-ghost btn-xs"
                            tabIndex={-1}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-error text-error-content rounded-lg text-sm z-50">
                    {error}
                </div>
            )}

            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                >
                    {results.map((set, index) => (
                        <div
                            key={set.set_num}
                            onClick={() => handleSelectSet(set)}
                            className={`p-3 cursor-pointer border-b border-base-200 last:border-b-0 transition-colors ${index === selectedIndex ? 'bg-primary/10' : 'hover:bg-base-200'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                {set.set_img_url && (
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded">
                                            <img
                                                src={set.set_img_url}
                                                alt={set.name}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {set.name}
                                    </div>
                                    <div className="text-xs opacity-70 flex items-center gap-2">
                                        <span className="badge badge-primary badge-xs">#{set.set_num}</span>
                                        <span>{set.year}</span>
                                        <span>{set.num_parts} parts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && searchTerm.length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-base-100 border border-base-300 rounded-lg shadow-lg text-center text-sm opacity-70 z-50">
                    No sets found for "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default SetSearch;