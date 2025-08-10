import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { setsApi, missingPartsApi, setPartsApi } from '../../services/api';
import { AddMissingPartsModal } from '../../components/sets';
import type { SetWithParts, MissingPart, SetPart } from '../../types/api';

export default function SetDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [set, setSet] = useState<SetWithParts | null>(null);
    const [missingParts, setMissingParts] = useState<MissingPart[]>([]);
    const [setParts, setSetParts] = useState<SetPart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'parts' | 'missing' | 'edit'>('parts');
    const [selectedParts, setSelectedParts] = useState<{ [key: number]: number }>({});
    const [editMode, setEditMode] = useState(false);
    const [editedSet, setEditedSet] = useState<Partial<SetWithParts>>({});
    const [showAddMissingModal, setShowAddMissingModal] = useState(false);
    const [loadingSetParts, setLoadingSetParts] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchSetData = async () => {
            try {
                setLoading(true);
                const setId = parseInt(id);

                // Fetch set with parts
                const setResponse = await setsApi.getByIdWithParts(setId);
                setSet(setResponse.data);
                setEditedSet(setResponse.data);

                // Fetch missing parts
                try {
                    const missingResponse = await missingPartsApi.getBySetId(setId);
                    setMissingParts(missingResponse.data);
                } catch (missingError) {
                    // Missing parts might not exist, that's okay
                    console.log('No missing parts found or error fetching:', missingError);
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

    const handlePartQuantityChange = (setPartId: number, quantity: number) => {
        setSelectedParts(prev => ({
            ...prev,
            [setPartId]: quantity
        }));
    };

    const fetchSetParts = async (setId: number) => {
        try {
            setLoadingSetParts(true);
            const setPartsResponse = await setPartsApi.getBySetId(setId);
            setSetParts(setPartsResponse.data.set_parts);
        } catch (err) {
            console.error('Error fetching set parts:', err);
            setSetParts([]);
        } finally {
            setLoadingSetParts(false);
        }
    };

    const handleAddMissingPartsFromModal = async (selectedPartsFromModal: { [key: number]: number }) => {
        if (!set || Object.keys(selectedPartsFromModal).length === 0) return;

        try {
            const partRequests = Object.entries(selectedPartsFromModal)
                .filter(([, quantity]) => quantity > 0)
                .map(([setPartId, quantity]) => ({
                    set_part_id: parseInt(setPartId),
                    quantity
                }));

            if (partRequests.length === 0) return;

            await missingPartsApi.assign({
                set_id: set.id,
                part_requests: partRequests
            });

            // Refresh missing parts
            const missingResponse = await missingPartsApi.getBySetId(set.id);
            setMissingParts(missingResponse.data);

            // Show success message
            alert('Missing parts added successfully!');
        } catch (err) {
            console.error('Error adding missing parts:', err);
            alert('Failed to add missing parts');
        }
    };

    const handleAddMissingPartsFromTable = async () => {
        if (!set || Object.keys(selectedParts).length === 0) return;

        try {
            const partRequests = Object.entries(selectedParts)
                .filter(([, quantity]) => quantity > 0)
                .map(([setPartId, quantity]) => ({
                    set_part_id: parseInt(setPartId),
                    quantity
                }));

            if (partRequests.length === 0) return;

            await missingPartsApi.assign({
                set_id: set.id,
                part_requests: partRequests
            });

            // Refresh missing parts
            const missingResponse = await missingPartsApi.getBySetId(set.id);
            setMissingParts(missingResponse.data);
            setSelectedParts({});

            // Show success message
            alert('Missing parts added successfully!');
        } catch (err) {
            console.error('Error adding missing parts:', err);
            alert('Failed to add missing parts');
        }
    };

    const handleSaveSet = async () => {
        if (!set || !editedSet) return;

        try {
            await setsApi.update(set.id, editedSet);
            setSet({ ...set, ...editedSet });
            setEditMode(false);
            alert('Set updated successfully!');
        } catch (err) {
            console.error('Error updating set:', err);
            alert('Failed to update set');
        }
    };

    const handleMarkAsFound = async (missingPartId: number) => {
        try {
            await missingPartsApi.delete(missingPartId);

            // Refresh missing parts list
            if (set) {
                const missingResponse = await missingPartsApi.getBySetId(set.id);
                setMissingParts(missingResponse.data);
            }

            alert('Part marked as found!');
        } catch (err) {
            console.error('Error marking part as found:', err);
            alert('Failed to mark part as found');
        }
    };

    const handleDeleteSet = async () => {
        if (!set) return;

        if (!confirm(`Are you sure you want to delete set "${set.name}"?`)) {
            return;
        }

        try {
            await setsApi.delete(set.id);
            navigate('/sets');
        } catch (err) {
            console.error('Error deleting set:', err);
            alert('Failed to delete set');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !set) {
        return (
            <div className="alert alert-error max-w-lg mx-auto mt-8">
                <span>{error || 'Set not found'}</span>
                <button className="btn btn-sm" onClick={() => navigate('/sets')}>
                    Go back to sets
                </button>
            </div>
        );
    }

    const missingPartsCount = missingParts.reduce((sum, mp) => sum + mp.quantity, 0);
    const totalParts = set.set_parts?.reduce((sum, part) => sum + part.quantity, 0) || 0;

    return (
        <div className="min-h-screen bg-base-200/30">
            {/* Navigation Header */}
            <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm border-b border-base-300">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between max-w-none">
                        <div className="flex items-center gap-4">
                            <button
                                className="btn btn-ghost btn-sm gap-2"
                                onClick={() => navigate('/sets')}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Sets
                            </button>
                            <div className="hidden sm:block">
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a href="/sets">Sets</a></li>
                                        <li>{set.name}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditMode(!editMode)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {editMode ? 'Cancel' : 'Edit'}
                            </button>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300">
                                    <li><a onClick={handleDeleteSet} className="text-error">Delete Set</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-base-300 mx-4">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="relative p-6 lg:p-8">
                        {editMode ? (
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <div className="aspect-square w-full max-w-xs mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-dashed border-base-300 bg-base-100 flex items-center justify-center">
                                        <img
                                            src={editedSet.set_img_url || set.set_img_url}
                                            alt={editedSet.name || set.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    <input
                                        type="text"
                                        className="input input-bordered w-full text-2xl lg:text-3xl font-bold bg-base-100/50"
                                        value={editedSet.name || ''}
                                        onChange={(e) => setEditedSet(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Set name"
                                    />
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            className="input input-bordered bg-base-100/50"
                                            value={editedSet.set_num || ''}
                                            onChange={(e) => setEditedSet(prev => ({ ...prev, set_num: e.target.value }))}
                                            placeholder="Set number"
                                        />
                                        <input
                                            type="number"
                                            className="input input-bordered bg-base-100/50"
                                            value={editedSet.year || ''}
                                            onChange={(e) => setEditedSet(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                            placeholder="Year"
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        className="input input-bordered w-full bg-base-100/50"
                                        value={editedSet.set_img_url || ''}
                                        onChange={(e) => setEditedSet(prev => ({ ...prev, set_img_url: e.target.value }))}
                                        placeholder="Image URL"
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <button className="btn btn-primary" onClick={handleSaveSet}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-ghost" onClick={() => setEditMode(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-1">
                                    <div className="aspect-square w-full max-w-xs mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-base-300">
                                        <img
                                            src={set.set_img_url}
                                            alt={set.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-base-content">{set.name}</h1>
                                        <p className="text-lg lg:text-xl text-base-content/70 flex items-center gap-2">
                                            <span className="badge badge-outline">#{set.set_num}</span>
                                            <span>•</span>
                                            <span>{set.year}</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4">
                                        <div className="stat bg-base-100/50 rounded-2xl border border-base-300 p-4">
                                            <div className="stat-figure text-primary">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                                                </svg>
                                            </div>
                                            <div className="stat-title text-xs">Total Parts</div>
                                            <div className="stat-value text-2xl lg:text-3xl text-primary">{totalParts}</div>
                                        </div>

                                        <div className="stat bg-base-100/50 rounded-2xl border border-base-300 p-4">
                                            <div className="stat-figure text-error">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <div className="stat-title text-xs">Missing</div>
                                            <div className="stat-value text-2xl lg:text-3xl text-error">{missingPartsCount}</div>
                                        </div>

                                        <div className="stat bg-base-100/50 rounded-2xl border border-base-300 p-4">
                                            <div className="stat-figure text-success">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="stat-title text-xs">Complete</div>
                                            <div className="stat-value text-2xl lg:text-3xl text-success">
                                                {totalParts > 0 ? Math.round(((totalParts - missingPartsCount) / totalParts) * 100) : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 px-4">
                    <button
                        className={`btn ${activeTab === 'parts' ? 'btn-primary' : 'btn-outline'} gap-2`}
                        onClick={() => setActiveTab('parts')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                        </svg>
                        All Parts ({set.set_parts?.length || 0})
                    </button>
                    <button
                        className={`btn ${activeTab === 'missing' ? 'btn-error' : 'btn-outline'} gap-2`}
                        onClick={() => setActiveTab('missing')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Missing Parts ({missingParts.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'parts' && (
                    <div className="bg-base-100 border-t border-base-300 overflow-hidden shadow-xl">
                        {/* Header Actions */}
                        <div className="p-4 lg:p-6 border-b border-base-200 bg-gradient-to-r from-primary/5 to-secondary/5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-base-content">All Parts</h2>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        Manage and track individual parts in this set
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        className="btn btn-secondary gap-2"
                                        onClick={async () => {
                                            if (set) {
                                                await fetchSetParts(set.id);
                                                setShowAddMissingModal(true);
                                            }
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Missing Parts
                                    </button>
                                    <button
                                        className="btn btn-primary gap-2"
                                        onClick={handleAddMissingPartsFromTable}
                                        disabled={Object.keys(selectedParts).length === 0}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Add Selected ({Object.keys(selectedParts).length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Parts Table - Full Width */}
                        <div className="w-full overflow-x-auto">
                            <table className="table w-full min-w-full">
                                <thead className="bg-base-200/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-4 text-left min-w-[300px]">Part Information</th>
                                        <th className="px-3 py-4 text-center w-28">Part #</th>
                                        <th className="px-3 py-4 text-center w-24">Quantity</th>
                                        <th className="px-3 py-4 text-center w-24">Color</th>
                                        <th className="px-3 py-4 text-center w-28">Type</th>
                                        <th className="px-3 py-4 text-center w-36">Mark Missing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {set.set_parts?.map((setPart) => (
                                        <tr key={setPart.id} className="hover:bg-base-50 border-b border-base-200 transition-colors">
                                            <td className="px-4 lg:px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative group flex-shrink-0">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-base-300 bg-base-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                            <img
                                                                src={setPart.part?.part_img_url || '/placeholder-part.png'}
                                                                alt={setPart.part?.name || 'Part'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/placeholder-part.png';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-base text-base-content">
                                                            {setPart.part?.name || 'Unknown Part'}
                                                        </h3>
                                                        <p className="text-sm text-base-content/60 mt-1">
                                                            Part #{setPart.part?.part_num}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <kbd className="kbd kbd-sm bg-base-200 text-xs font-mono">
                                                    {setPart.part?.part_num}
                                                </kbd>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <div className="badge badge-primary badge-lg font-bold">
                                                    {setPart.quantity}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <div className="badge badge-neutral">
                                                    {setPart.color_id}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                {setPart.is_spare ? (
                                                    <div className="badge badge-secondary gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Spare
                                                    </div>
                                                ) : (
                                                    <div className="badge badge-outline">
                                                        Regular
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="input input-bordered input-sm w-16 text-center"
                                                        min="0"
                                                        max={setPart.quantity}
                                                        value={selectedParts[setPart.id] || 0}
                                                        onChange={(e) => handlePartQuantityChange(
                                                            setPart.id,
                                                            parseInt(e.target.value) || 0
                                                        )}
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs text-base-content/50 hidden sm:inline whitespace-nowrap">
                                                        / {setPart.quantity}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {(!set.set_parts || set.set_parts.length === 0) && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">No parts data available</h3>
                                <p className="text-base-content/70">This set doesn't have detailed parts information.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'missing' && (
                    <div className="bg-base-100 border-t border-base-300 overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="p-4 lg:p-6 border-b border-base-200 bg-gradient-to-r from-error/5 to-warning/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-base-content">Missing Parts</h2>
                                    {missingParts.length > 0 && (
                                        <p className="text-sm text-base-content/70 mt-1">
                                            {missingPartsCount} parts are missing from this set
                                        </p>
                                    )}
                                </div>
                                {missingParts.length > 0 && (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-error">{missingPartsCount}</div>
                                        <div className="text-xs text-base-content/60">Missing</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {missingParts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">🎉</div>
                                <h3 className="text-2xl font-bold mb-3">No Missing Parts!</h3>
                                <p className="text-lg text-base-content/70 mb-6">This set is complete - all parts are accounted for.</p>
                                <div className="badge badge-success badge-lg gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    100% Complete
                                </div>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="table w-full min-w-full">
                                    <thead className="bg-base-200/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 lg:px-6 py-4 text-left min-w-[300px]">Part Information</th>
                                            <th className="px-3 py-4 text-center w-28">Part #</th>
                                            <th className="px-3 py-4 text-center w-24">Missing</th>
                                            <th className="px-3 py-4 text-center w-24">Total</th>
                                            <th className="px-3 py-4 text-center w-24">Color</th>
                                            <th className="px-3 py-4 text-center w-28">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missingParts.map((missingPart) => (
                                            <tr key={missingPart.id} className="hover:bg-error/5 border-b border-base-200 transition-colors">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group flex-shrink-0">
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-error/30 bg-base-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                                <img
                                                                    src={missingPart.set_part?.part?.part_img_url || '/placeholder-part.png'}
                                                                    alt={missingPart.set_part?.part?.name || 'Part'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-error-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base text-base-content">
                                                                {missingPart.set_part?.part?.name || 'Unknown Part'}
                                                            </h3>
                                                            <p className="text-sm text-base-content/60 mt-1">
                                                                Part #{missingPart.set_part?.part?.part_num}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <kbd className="kbd kbd-sm bg-base-200 text-xs font-mono">
                                                        {missingPart.set_part?.part?.part_num}
                                                    </kbd>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="badge badge-error badge-lg font-bold">
                                                        {missingPart.quantity}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="badge badge-primary badge-lg">
                                                        {missingPart.set_part?.quantity}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="badge badge-neutral">
                                                        {missingPart.set_part?.color_id}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <button
                                                        className="btn btn-success btn-sm gap-2"
                                                        onClick={() => handleMarkAsFound(missingPart.id)}
                                                        title="Mark this part as found"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Found
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AddMissingPartsModal
                isOpen={showAddMissingModal}
                onClose={() => setShowAddMissingModal(false)}
                parts={setParts}
                onAddMissingParts={handleAddMissingPartsFromModal}
                loading={loadingSetParts}
            />
        </div>
    );
}
