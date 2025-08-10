import { Link } from 'react-router-dom';
import type { Set } from '../../types/api';
import SetAvatar from './SetAvatar';

interface SetTableRowProps {
    set: Set;
    onDetailsClick?: (set: Set) => void;
}

export default function SetTableRow({ set }: SetTableRowProps) {
    return (
        <tr key={set.id}>
            <td>
                <SetAvatar set={set} />
            </td>
            <td>{set.set_num}</td>
            <td>{set.year}</td>
            <th>
                <Link
                    to={`/sets/${set.id}`}
                    className="btn btn-ghost btn-xs"
                >
                    details
                </Link>
            </th>
        </tr>
    );
}
