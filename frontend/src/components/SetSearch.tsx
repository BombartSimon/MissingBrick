import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getApiErrorMessage, searchSets } from '../services/api';
import type { RebrickableSet } from '../types/api';
import { Badge, Button, cn, Input } from './ui';

interface SetSearchProps {
    onSelectSet: (set: RebrickableSet) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const SetSearch: React.FC<SetSearchProps> = ({
    onSelectSet,
    placeholder = 'Search for LEGO sets...',
    disabled = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<RebrickableSet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const debounce = <T extends (...args: never[]) => void>(func: T, wait: number) => {
        let timeout: ReturnType<typeof setTimeout>;
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
            setError(getApiErrorMessage(err));
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

    const handleInputBlur = (event: React.FocusEvent) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.relatedTarget as Node)) return;
        setTimeout(() => setIsOpen(false), 150);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) handleSelectSet(results[selectedIndex]);
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
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-9 pr-20"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />}
                    {searchTerm && (
                        <Button type="button" onClick={clearSearch} variant="ghost" size="icon" className="h-7 w-7" tabIndex={-1}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {error && <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-100">{error}</div>}

            {isOpen && results.length > 0 && (
                <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
                    {results.map((set, index) => (
                        <button
                            type="button"
                            key={set.set_num}
                            onClick={() => handleSelectSet(set)}
                            className={cn('flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition-colors last:border-b-0 dark:border-neutral-800', index === selectedIndex ? 'bg-amber-50 dark:bg-amber-950' : 'hover:bg-slate-50 dark:hover:bg-neutral-900')}
                        >
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900">
                                {set.set_img_url ? <img src={set.set_img_url} alt={set.name} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-slate-950 dark:text-neutral-50">{set.name}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                                    <Badge variant="primary">#{set.set_num}</Badge>
                                    <span>{set.year}</span>
                                    <span>{set.num_parts} parts</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && searchTerm.length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    No sets found for "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default SetSearch;
