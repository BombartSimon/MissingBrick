import type { Set } from '../../types/api';
import SetAvatar from './SetAvatar';

interface SetTableRowProps {
    set: Set;
    onDetailsClick?: (set: Set) => void;
}

export default function SetTableRow({ set, onDetailsClick }: SetTableRowProps) {
    const handleDetailsClick = () => {
        onDetailsClick?.(set);
    };

    return (
        <tr key={set.id}>
            <td>
                <SetAvatar set={set} />
            </td>
            <td>{set.set_num}</td>
            <td>{set.year}</td>
            <th>
                <button
                    className="btn btn-ghost btn-xs"
                    onClick={handleDetailsClick}
                >
                    details
                </button>
            </th>
        </tr>
    );
}
