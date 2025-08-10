import type { Set } from '../../types/api';
import SetTableRow from './SetTableRow';

interface SetsTableProps {
    sets: Set[];
    onSetDetailsClick?: (set: Set) => void;
}

export default function SetsTable({ sets, onSetDetailsClick }: SetsTableProps) {
    return (

        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Set Num</th>
                        <th>Year</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sets.map((set) => (
                        <SetTableRow
                            key={set.id}
                            set={set}
                            onDetailsClick={onSetDetailsClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
