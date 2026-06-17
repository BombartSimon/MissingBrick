import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

type ImageLightboxProps = {
    imageUrl: string;
    alt?: string;
    open: boolean;
    onClose: () => void;
}

export default function ImageLightbox({ imageUrl, alt, open, onClose }: ImageLightboxProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative max-h-full max-w-full overflow-hidden rounded-lg" onClick={(event) => event.stopPropagation()}>
                <Button className="absolute right-3 top-3 bg-white/90 dark:bg-neutral-950/90" variant="secondary" size="icon" onClick={onClose} aria-label="Close image">
                    <X className="h-4 w-4" />
                </Button>
                <img src={imageUrl} alt={alt || ''} className="block max-h-[90vh] max-w-[90vw] object-contain" />
            </div>
        </div>
    );
}
