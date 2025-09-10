import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setsApi } from '../../services/api';
import type { Set } from '../../types/api';
import ImageLightbox from '../../components/ImageLightbox';

export default function SetsPage() {
    const [sets, setSets] = useState<Set[]>([]);
    const [filteredSets, setFilteredSets] = useState<Set[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [newSetNum, setNewSetNum] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState<string>('');

    useEffect(() => {
        fetchSets();
    }, []);

    useEffect(() => {
        filterSets();
    }, [sets, searchTerm, yearFilter]);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const response = await setsApi.getAll();
            setSets(response.data?.sets || []);
        } catch (error) {
            console.error('Error fetching sets:', error);
            setSets([]);
        } finally {
            setLoading(false);
        }
    };

    const filterSets = () => {
        let filtered = sets.filter(set => {
            const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                set.set_num.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear = yearFilter === '' || set.year.toString() === yearFilter;
            return matchesSearch && matchesYear;
        });

        setFilteredSets(filtered);
    };

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSetNum.trim()) return;

        try {
            setIsAdding(true);
            await setsApi.create({ set_num: newSetNum.trim() });
            setNewSetNum('');
            await fetchSets();
        } catch (error) {
            console.error('Error creating set:', error);
            alert('Failed to create set. Please check if the set number exists.');
        } finally {
            setIsAdding(false);
        }
    };

    const uniqueYears = [...new Set(sets.map(set => set.year))].sort((a, b) => b - a);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My LEGO Sets</h1>
                <p className="text-base-content/70">Manage your collection and track missing parts</p>
            </div>

            {/* Add Set Form */}
            <div className="card bg-base-200 shadow-lg mb-8">
                <div className="card-body">
                    <h3 className="card-title">Add New Set</h3>
                    <form onSubmit={handleCreateSet} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter set number (e.g., 75354)"
                            className="input input-bordered flex-1"
                            value={newSetNum}
                            onChange={(e) => setNewSetNum(e.target.value)}
                            disabled={isAdding}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isAdding || !newSetNum.trim()}
                        >
                            {isAdding ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                'Add'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search sets..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="select select-bordered w-48"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                >
                    <option value="">All years</option>
                    {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                {(searchTerm || yearFilter) && (
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            setSearchTerm('');
                            setYearFilter('');
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Sets List */}
            {filteredSets.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">
                        {sets.length === 0 ? 'No sets yet' : 'No sets found'}
                    </h3>
                    <p className="text-base-content/70">
                        {sets.length === 0
                            ? 'Add your first LEGO set to get started'
                            : 'Try adjusting your search or filters'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSets.map((set) => (
                        <Link
                            key={set.id}
                            to={`/sets/${set.id}`}
                            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="card-body">
                                <div className="flex items-center gap-6">
                                    <div className="avatar">
                                        <div className="w-20 h-20 rounded-lg">
                                            <img
                                                src={set.set_img_url}
                                                alt={set.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/api/placeholder/80/80';
                                                }}
                                                className="object-cover w-full h-full cursor-zoom-in"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setLightboxImage(set.set_img_url || '/api/placeholder/80/80');
                                                    setLightboxAlt(set.name);
                                                    setLightboxOpen(true);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="card-title">
                                            {set.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="badge badge-primary">
                                                #{set.set_num}
                                            </div>
                                            <div className="badge badge-outline">
                                                {set.year}
                                            </div>
                                            <span className="text-sm text-base-content/70">
                                                {set.num_parts} parts
                                            </span>
                                            <div className="ml-auto flex-shrink-0">
                                                <a
                                                    href={`https://www.lego.com/en-be/service/building-instructions/${encodeURIComponent(set.set_num.replace(/-1$/, ''))}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline btn-sm normal-case hover:bg-base-200 transition-colors focus:ring focus:ring-primary/30"
                                                    title={`View building instructions for ${set.set_num}`}
                                                    aria-label={`View building instructions for ${set.set_num}`}
                                                    // prevent the parent Link from receiving the click (mouse + keyboard)
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                >
                                                    View Building Instructions
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <ImageLightbox
                imageUrl={lightboxImage || ''}
                alt={lightboxAlt}
                open={lightboxOpen}
                onClose={() => {
                    setLightboxOpen(false);
                    setLightboxImage(null);
                    setLightboxAlt('');
                }}
            />
        </div>
    );
}
