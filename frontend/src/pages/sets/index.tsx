import { useEffect, useRef, useState } from 'react';
import { setsApi } from '../../services/api';
import type { Set } from '../../types/api';
import { SetsTable } from '../../components/sets';

export default function SetsPage() {
    const [setsData, setSetsData] = useState<Set[]>([]);
    const [newSetNum, setNewSetNum] = useState('');
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await setsApi.getAll();
                console.log('Fetched sets:', response.data);

                if (response.data && response.data.sets && Array.isArray(response.data.sets)) {
                    setSetsData(response.data.sets);
                } else {
                    console.error('Invalid response structure:', response.data);
                    setSetsData([]);
                }
            } catch (error) {
                console.error('Error fetching sets:', error);
                setSetsData([]);
            }
        };

        fetchData();
    }, []);

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSetNum.trim()) {
            alert('Set number is required');
            return;
        }

        try {
            const response = await setsApi.create({ set_num: newSetNum });
            alert(`Set created: ${response.data.name}`);
            setNewSetNum('');

            // Refresh sets list
            const updatedSets = await setsApi.getAll();
            setSetsData(updatedSets.data.sets);
        } catch (error) {
            console.error('Error creating set:', error);
            alert('Failed to create set');
        }
    };

    return (
        <>
            <button className="btn" onClick={() => modalRef.current?.showModal()}>Create Set</button>
            <dialog ref={modalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create a New Set</h3>
                    <form onSubmit={handleCreateSet}>
                        <input
                            type="text"
                            placeholder="Set Number"
                            value={newSetNum}
                            onChange={(e) => setNewSetNum(e.target.value)}
                            className="input input-bordered w-full mb-4"
                        />
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => modalRef.current?.close()}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* Render the sets table */}
            <SetsTable sets={setsData} />
        </>
    );
}