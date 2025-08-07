import { useEffect, useState } from 'react';
import { setsApi } from '../../services/api';
import type { Set } from '../../types/api';
import { SetsTable } from '../../components/sets';

export default function SetsPage() {

    const [setsData, setSetsData] = useState<Set[]>([]);

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

    const handleSetDetailsClick = (set: Set) => {
        console.log('Details clicked for set:', set);
        // TODO: Navigate to set details page or open modal
    };

    return <SetsTable
        sets={setsData}
        onSetDetailsClick={handleSetDetailsClick}
    />;
}