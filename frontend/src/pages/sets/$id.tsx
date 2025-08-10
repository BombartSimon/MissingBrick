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
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/sets')}
                >
                    ← Back to Sets
                </button>
                <div className="flex gap-2">
                    <button
                        className="btn btn-outline"
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Cancel Edit' : 'Edit Set'}
                    </button>
                    <button
                        className="btn btn-error"
                        onClick={handleDeleteSet}
                    >
                        Delete Set
                    </button>
                </div>
            </div>

            {/* Set Overview */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="avatar">
                            <div className="w-32 h-32 rounded-xl">
                                <img
                                    src={set.set_img_url}
                                    alt={set.name}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            {editMode ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        className="input input-bordered w-full text-2xl font-bold"
                                        value={editedSet.name || ''}
                                        onChange={(e) => setEditedSet(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Set name"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            className="input input-bordered"
                                            value={editedSet.set_num || ''}
                                            onChange={(e) => setEditedSet(prev => ({ ...prev, set_num: e.target.value }))}
                                            placeholder="Set number"
                                        />
                                        <input
                                            type="number"
                                            className="input input-bordered"
                                            value={editedSet.year || ''}
                                            onChange={(e) => setEditedSet(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                            placeholder="Year"
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        className="input input-bordered w-full"
                                        value={editedSet.set_img_url || ''}
                                        onChange={(e) => setEditedSet(prev => ({ ...prev, set_img_url: e.target.value }))}
                                        placeholder="Image URL"
                                    />
                                    <div className="flex gap-2">
                                        <button className="btn btn-primary" onClick={handleSaveSet}>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-ghost" onClick={() => setEditMode(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold mb-2">{set.name}</h1>
                                    <p className="text-xl text-base-content/70 mb-4">Set #{set.set_num}</p>
                                    <div className="stats stats-horizontal shadow">
                                        <div className="stat">
                                            <div className="stat-title">Year</div>
                                            <div className="stat-value text-2xl">{set.year}</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-title">Total Parts</div>
                                            <div className="stat-value text-2xl">{totalParts}</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-title">Missing Parts</div>
                                            <div className="stat-value text-2xl text-error">{missingPartsCount}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-lifted mb-6">
                <button
                    className={`tab ${activeTab === 'parts' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('parts')}
                >
                    All Parts ({set.set_parts?.length || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'missing' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('missing')}
                >
                    Missing Parts ({missingParts.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'parts' && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title">All Parts</h2>
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={async () => {
                                        if (set) {
                                            await fetchSetParts(set.id);
                                            setShowAddMissingModal(true);
                                        }
                                    }}
                                >
                                    Add Missing Parts
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddMissingPartsFromTable}
                                    disabled={Object.keys(selectedParts).length === 0}
                                >
                                    Add Selected as Missing
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Part Number</th>
                                        <th>Quantity</th>
                                        <th>Color ID</th>
                                        <th>Spare</th>
                                        <th>Mark as Missing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {set.set_parts?.map((setPart) => (
                                        <tr key={setPart.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-12 h-12 rounded">
                                                            <img
                                                                src={setPart.part?.part_img_url || '/placeholder-part.png'}
                                                                alt={setPart.part?.name || 'Part'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">
                                                            {setPart.part?.name || 'Unknown Part'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{setPart.part?.part_num}</td>
                                            <td>
                                                <span className="badge badge-primary">
                                                    {setPart.quantity}
                                                </span>
                                            </td>
                                            <td>{setPart.color_id}</td>
                                            <td>
                                                {setPart.is_spare && (
                                                    <span className="badge badge-secondary">Spare</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="input input-bordered input-sm w-20"
                                                        min="0"
                                                        max={setPart.quantity}
                                                        value={selectedParts[setPart.id] || 0}
                                                        onChange={(e) => handlePartQuantityChange(
                                                            setPart.id,
                                                            parseInt(e.target.value) || 0
                                                        )}
                                                    />
                                                    <span className="text-sm text-base-content/70">
                                                        / {setPart.quantity}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'missing' && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Missing Parts</h2>

                        {missingParts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold mb-2">No Missing Parts!</h3>
                                <p className="text-base-content/70">This set is complete.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Part</th>
                                            <th>Part Number</th>
                                            <th>Missing Quantity</th>
                                            <th>Total Quantity</th>
                                            <th>Color ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missingParts.map((missingPart) => (
                                            <tr key={missingPart.id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="w-12 h-12 rounded">
                                                                <img
                                                                    src={missingPart.set_part?.part?.part_img_url || '/placeholder-part.png'}
                                                                    alt={missingPart.set_part?.part?.name || 'Part'}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">
                                                                {missingPart.set_part?.part?.name || 'Unknown Part'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{missingPart.set_part?.part?.part_num}</td>
                                                <td>
                                                    <span className="badge badge-error">
                                                        {missingPart.quantity}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {missingPart.set_part?.quantity}
                                                    </span>
                                                </td>
                                                <td>{missingPart.set_part?.color_id}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleMarkAsFound(missingPart.id)}
                                                    >
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
                </div>
            )}

            {/* Add Missing Parts Modal */}
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
