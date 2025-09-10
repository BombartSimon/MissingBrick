import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { setsApi, missingPartsApi } from '../../services/api';
import type { SetWithParts, MissingPart } from '../../types/api';
import ImageLightbox from '../../components/ImageLightbox';

export default function SetDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [set, setSet] = useState<SetWithParts | null>(null);
    const [missingParts, setMissingParts] = useState<MissingPart[]>([]);
    const [filteredParts, setFilteredParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState<string>('');

    useEffect(() => {
        if (!id) return;

        const fetchSetData = async () => {
            try {
                setLoading(true);
                const setId = parseInt(id);

                const setResponse = await setsApi.getByIdWithParts(setId);
                setSet(setResponse.data);

                try {
                    const missingResponse = await missingPartsApi.getBySetId(setId);
                    setMissingParts(missingResponse.data);
                } catch {
                    setMissingParts([]);
                }
            } catch (err) {
                setError('Failed to load set details');
                console.error('Error fetching set:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSetData();
    }, [id]);

    useEffect(() => {
        if (!set?.set_parts) return;

        let filtered = set.set_parts.filter(setPart => {
            const matchesSearch = setPart.part?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                setPart.part?.part_num.toLowerCase().includes(searchTerm.toLowerCase());

            if (showOnlyMissing) {
                const isMissing = missingParts.some(mp =>
                    mp.part_id === setPart.part_id && mp.color_id === setPart.color_id
                );
                return matchesSearch && isMissing;
            }

            return matchesSearch;
        });

        setFilteredParts(filtered);
    }, [set?.set_parts, searchTerm, showOnlyMissing, missingParts]);

    const handleMarkAsFound = async (missingPartId: number) => {
        try {
            await missingPartsApi.delete(missingPartId);
            if (set) {
                const missingResponse = await missingPartsApi.getBySetId(set.id);
                setMissingParts(missingResponse.data);
            }
        } catch (err) {
            console.error('Error marking part as found:', err);
            alert('Failed to mark part as found');
        }
    };

    const handleMarkPartAsMissing = async (setPartId: number, quantity: number) => {
        if (!set || quantity <= 0) return;

        try {
            await missingPartsApi.assign({
                set_id: set.id,
                part_requests: [{ set_part_id: setPartId, quantity }]
            });

            const missingResponse = await missingPartsApi.getBySetId(set.id);
            setMissingParts(missingResponse.data);
        } catch (err) {
            console.error('Error adding missing part:', err);
            alert('Failed to add missing part');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (error || !set) {
        return (
            <div className="container mx-auto p-6">
                <div className="alert alert-error">
                    <span>{error || 'Set not found'}</span>
                    <button
                        className="btn btn-sm"
                        onClick={() => navigate('/sets')}
                    >
                        Go back to sets
                    </button>
                </div>
            </div>
        );
    }

    const totalParts = set.set_parts?.reduce((sum, part) => sum + part.quantity, 0) || 0;
    const missingPartsCount = missingParts.reduce((sum, mp) => sum + mp.quantity, 0);
    const completedParts = totalParts - missingPartsCount;
    const completionPercentage = totalParts > 0 ?
        Math.floor((completedParts / totalParts) * 100) : 0;

    // log calculations to verify
    console.log('Total Parts:', totalParts);
    console.log('Missing Parts Count:', missingPartsCount);
    console.log('Completed Parts:', completedParts);
    console.log('Completion Percentage:', completionPercentage);



    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/sets')}
                >
                    ← Back to Sets
                </button>
                <button
                    className="btn btn-error"
                    onClick={async () => {
                        if (confirm(`Delete "${set.name}"?`)) {
                            try {
                                await setsApi.delete(set.id);
                                navigate('/sets');
                            } catch {
                                alert('Failed to delete set');
                            }
                        }
                    }}
                >
                    Delete Set
                </button>
            </div>

            {/* Set Information */}
            <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="avatar">
                            <div className="w-48 h-48 rounded-lg">
                                <img
                                    src={set.set_img_url}
                                    alt={set.name}
                                    onError={(e) => {
                                        e.currentTarget.src = '/api/placeholder/192/192';
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
                            <h1 className="text-3xl font-bold mb-4">{set.name}</h1>
                            <div className="flex gap-4 mb-6">
                                <div className="badge badge-primary badge-lg">
                                    #{set.set_num}
                                </div>
                                <div className="badge badge-outline badge-lg">
                                    {set.year}
                                </div>
                            </div>

                            <div className="stats shadow">
                                <div className="stat">
                                    <div className="stat-title">Total Parts</div>
                                    <div className="stat-value text-primary">{totalParts}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Missing</div>
                                    <div className="stat-value text-error">{missingPartsCount}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Complete</div>
                                    <div className="stat-value text-success">{completionPercentage}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Missing Parts */}
            {missingParts.length > 0 && (
                <div className="card bg-base-100 shadow-lg mb-8">
                    <div className="card-body">
                        <h2 className="card-title text-error">
                            Missing Parts ({missingParts.length})
                        </h2>

                        <div className="space-y-4">
                            {missingParts.map((missingPart) => (
                                <div key={missingPart.id} className="alert alert-error">
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="avatar">
                                            <div className="w-16 h-16 rounded-lg">
                                                <img
                                                    src={missingPart.part?.part_img_url || '/api/placeholder/64/64'}
                                                    alt={missingPart.part?.name}
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/api/placeholder/64/64';
                                                    }}
                                                    className="object-cover w-full h-full cursor-zoom-in"
                                                    onClick={() => {
                                                        if (missingPart.part?.part_img_url) {
                                                            setLightboxImage(missingPart.part.part_img_url);
                                                            setLightboxAlt(missingPart.part.name || '');
                                                            setLightboxOpen(true);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">
                                                {missingPart.part?.name}
                                            </h3>
                                            <div className="text-sm opacity-70">
                                                #{missingPart.part?.part_num} • {missingPart.color_name}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="badge badge-error badge-lg">{missingPart.quantity}</div>
                                            <div className="text-xs opacity-70">missing</div>
                                        </div>

                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleMarkAsFound(missingPart.id)}
                                        >
                                            Found
                                        </button>
                                        <a
                                            href={`https://www.lego.com/en-be/pick-and-build/pick-a-brick?icmp=PAB_All_Pieces&query=${encodeURIComponent(missingPart.part?.part_num || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Buy ${missingPart.part?.part_num} on LEGO pick-and-build`}
                                            className="btn btn-outline btn-sm flex items-center gap-2 transition-colors hover:bg-base-200"
                                        >
                                            <span>Buy</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* All Parts with Search */}
            <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title">
                        All Parts ({set.set_parts?.length || 0})
                    </h2>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="form-control flex-1">
                            <input
                                type="text"
                                placeholder="Search parts..."
                                className="input input-bordered"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text mr-2">Show only missing</span>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={showOnlyMissing}
                                    onChange={(e) => setShowOnlyMissing(e.target.checked)}
                                />
                            </label>
                        </div>
                    </div>

                    {filteredParts && filteredParts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParts.map((setPart) => {
                                        const isMissing = missingParts.some(mp =>
                                            mp.part_id === setPart.part_id && mp.color_id === setPart.color_id
                                        );
                                        return (
                                            <tr key={setPart.id} className={isMissing ? 'bg-error/10' : ''}>
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <div className="avatar">
                                                            <div className="w-12 h-12 rounded-lg">
                                                                <img
                                                                    src={setPart.part?.part_img_url || '/api/placeholder/48/48'}
                                                                    alt={setPart.part?.name}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/api/placeholder/48/48';
                                                                    }}
                                                                    className="object-cover w-full h-full cursor-zoom-in"
                                                                    onClick={() => {
                                                                        if (setPart.part?.part_img_url) {
                                                                            setLightboxImage(setPart.part.part_img_url);
                                                                            setLightboxAlt(setPart.part.name || '');
                                                                            setLightboxOpen(true);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {setPart.part?.name}
                                                            </div>
                                                            <div className="text-sm opacity-70">
                                                                #{setPart.part?.part_num}
                                                            </div>
                                                            <div className='text-sm opacity-70 flex items-center gap-2'>
                                                                {setPart.color_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="badge badge-primary">
                                                        {setPart.quantity}
                                                    </div>
                                                </td>
                                                <td>
                                                    {!isMissing && (
                                                        <button
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() => {
                                                                const qty = prompt(`How many of "${setPart.part?.name}" are missing? (Max: ${setPart.quantity})`);
                                                                if (qty) {
                                                                    const quantity = parseInt(qty);
                                                                    if (quantity > 0 && quantity <= setPart.quantity) {
                                                                        handleMarkPartAsMissing(setPart.id, quantity);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Mark Missing
                                                        </button>
                                                    )}
                                                    {isMissing && (
                                                        <div className="badge badge-error">Missing</div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-4xl mb-4">📦</div>
                            <p className="text-base-content/70">
                                {searchTerm || showOnlyMissing
                                    ? 'No parts match your filters.'
                                    : 'No parts data available for this set.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
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
