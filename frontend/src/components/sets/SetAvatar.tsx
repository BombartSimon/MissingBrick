import type { Set } from '../../types/api';

interface SetAvatarProps {
    set: Set;
}

export default function SetAvatar({ set }: SetAvatarProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="avatar">
                <div className="mask mask-squircle h-12 w-12">
                    <img
                        src={set.set_img_url}
                        alt={`${set.name} set image`}
                    />
                </div>
            </div>
            <div>
                <div className="font-bold">{set.name}</div>
                <div className="text-sm opacity-50">{set.num_parts} parts</div>
            </div>
        </div>
    );
}
