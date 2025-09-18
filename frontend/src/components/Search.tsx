import React, { useState, useCallback, useEffect } from 'react';
import { searchSets } from '../services/api';
import type { RebrickableSet } from '../types/api';

interface SetSearchProps {
    onSelectSet: (set: RebrickableSet) => void;
    placeholder?: string;
}

export const SetSearch: React.FC<SetSearchProps> = ({
    onSelectSet,
    placeholder = "Search for LEGO sets..."
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<RebrickableSet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await searchSets(term, 1, 10);
            setResults(response.results);
            setIsOpen(true);
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
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleInputFocus = () => {
        if (results.length > 0) {
            setIsOpen(true);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {error && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {results.map((set) => (
                        <div
                            key={set.set_num}
                            onClick={() => handleSelectSet(set)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex items-center space-x-3">
                                {set.set_img_url && (
                                    <img
                                        src={set.set_img_url}
                                        alt={set.name}
                                        className="w-12 h-12 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {set.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Set #{set.set_num} • {set.year} • {set.num_parts} parts
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};