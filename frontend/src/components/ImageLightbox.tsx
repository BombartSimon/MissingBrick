import { useEffect } from "react";

type ImageLightboxProps = {
    imageUrl: string;
    alt?: string;
    open: boolean;
    onClose: () => void;
}


export default function ImageLightbox({ imageUrl, alt, open, onClose }: ImageLightboxProps) {
    const altText = alt || '';

    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);

    }, [open, onClose]);

    if (!open || !imageUrl) return null;


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="max-w-full max-h-full rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-4 right-4 btn btn-sm btn-ghost z-50"
                    onClick={onClose}
                    aria-label="Close image"
                >
                    ✕
                </button>
                <img
                    src={imageUrl}
                    alt={altText}
                    className="max-w-[90vw] max-h-[90vh] object-contain block"
                />
            </div>
        </div>
    );
}