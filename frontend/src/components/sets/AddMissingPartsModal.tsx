import { useState, useEffect } from 'react';
import type { SetPart } from '../../types/api';

interface AddMissingPartsModalProps {
    isOpen: boolean;
    onClose: () => void;
    parts: SetPart[];
    onAddMissingParts: (selectedParts: { [key: number]: number }) => void;
    loading?: boolean;
}

export default function AddMissingPartsModal({
    isOpen,
    onClose,
    parts,
    onAddMissingParts,
    loading = false
}: AddMissingPartsModalProps) {
    const [selectedParts, setSelectedParts] = useState<{ [key: number]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedParts({});
            setSearchTerm('');
        }
    }, [isOpen]);

    const handlePartQuantityChange = (setPartId: number, quantity: number) => {
        setSelectedParts(prev => ({
            ...prev,
            [setPartId]: quantity
        }));
    };

    const handleSubmit = () => {
        onAddMissingParts(selectedParts);
        onClose();
    };


    const filteredParts = parts.filter(part =>
        part.part?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.part?.part_num?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCount = Object.values(selectedParts).filter(qty => qty > 0).length;

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">Add Missing Parts</h3>

                {/* Search */}
                <div className="form-control mb-4">
                    <input
                        type="text"
                        className="input input-bordered"
                        placeholder="Search parts by name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Parts list */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <span className="loading loading-spinner loading-lg"></span>
                            <span className="ml-2">Loading parts...</span>
                        </div>
                    ) : (
                        <table className="table table-zebra table-pin-rows">
                            <thead>
                                <tr>
                                    <th>Part</th>
                                    <th>Available</th>
                                    <th>Missing Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParts.map((setPart) => (
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
                                                    <div className="text-sm opacity-50">
                                                        #{setPart.part?.part_num}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">
                                                {setPart.quantity}
                                            </span>
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
                    )}
                </div>

                <div className="modal-action">
                    <div className="flex-1">
                        {selectedCount > 0 && (
                            <span className="text-sm text-base-content/70">
                                {selectedCount} part{selectedCount > 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>
                    <button className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={selectedCount === 0}
                    >
                        Add Missing Parts
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
