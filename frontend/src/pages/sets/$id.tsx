import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Camera, ClipboardList, ExternalLink, ImageIcon, MapPin, PackageCheck, Save, Search, Star, Trash2, Upload } from 'lucide-react';
import { getApiErrorMessage, missingPartsApi, resolveAssetUrl, setPhotosApi, setsApi } from '../../services/api';
import type { BuildStatus, MissingPart, PhotoType, SetPart, SetPhoto, SetWithParts } from '../../types/api';
import ImageLightbox from '../../components/ImageLightbox';
import { AnchorButton, Badge, Button, Checkbox, EmptyState, ErrorBanner, Input, Modal, PageHeader, Spinner, StatTile, TableShell, Textarea, tableActionCellClass, tableActionHeaderClass, tableCellClass, tableHeaderClass, tableRowClass } from '../../components/ui';

const legoPickABrickUrl = (partNum: string) =>
    `https://www.lego.com/en-be/pick-and-build/pick-a-brick?icmp=PAB_All_Pieces&query=${encodeURIComponent(partNum)}`;

const buildStatusOptions: Array<{ value: BuildStatus; label: string }> = [
    { value: 'not_started', label: 'Not started' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'building', label: 'Building' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'complete', label: 'Complete' },
];

const photoTypeOptions: Array<{ value: PhotoType; label: string }> = [
    { value: 'box', label: 'Box' },
    { value: 'instructions', label: 'Instructions' },
    { value: 'storage', label: 'Storage' },
    { value: 'build', label: 'Build' },
    { value: 'other', label: 'Other' },
];

type MissingModalState = { setPart: SetPart; quantity: number } | null;
type EditModalState = { missingPart: MissingPart; quantity: number; notes: string } | null;

export default function SetDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [set, setSet] = useState<SetWithParts | null>(null);
    const [missingParts, setMissingParts] = useState<MissingPart[]>([]);
    const [photos, setPhotos] = useState<SetPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notesForm, setNotesForm] = useState<{ notes: string; storage_location: string; build_status: BuildStatus }>({ notes: '', storage_location: '', build_status: 'not_started' });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoTitle, setPhotoTitle] = useState('');
    const [photoType, setPhotoType] = useState<PhotoType>('other');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);
    const [missingModal, setMissingModal] = useState<MissingModalState>(null);
    const [editModal, setEditModal] = useState<EditModalState>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState('');

    const setId = Number(id);

    const fetchSetData = async () => {
        if (!setId) return;
        try {
            setLoading(true);
            setError(null);
            const [setResponse, missingResponse, photosResponse] = await Promise.all([
                setsApi.getByIdWithParts(setId),
                missingPartsApi.getBySetId(setId).catch(() => ({ data: [] as MissingPart[] })),
                setPhotosApi.list(setId).catch(() => ({ data: { photos: [] as SetPhoto[] } })),
            ]);
            setSet(setResponse.data);
            setMissingParts(missingResponse.data);
            setPhotos(photosResponse.data.photos || []);
            setNotesForm({
                notes: setResponse.data.notes || '',
                storage_location: setResponse.data.storage_location || '',
                build_status: setResponse.data.build_status || 'not_started',
            });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetData();
    }, [setId]);

    const missingByIdentity = useMemo(() => {
        const map = new Map<string, MissingPart>();
        missingParts.forEach((part) => map.set(`${part.part_id}-${part.color_id}`, part));
        return map;
    }, [missingParts]);

    const filteredParts = useMemo(() => {
        if (!set?.set_parts) return [];
        const term = searchTerm.toLowerCase();
        return set.set_parts.filter((setPart) => {
            const matchesSearch =
                setPart.part?.name.toLowerCase().includes(term) ||
                setPart.part?.part_num.toLowerCase().includes(term) ||
                setPart.color_name.toLowerCase().includes(term);
            const isMissing = missingByIdentity.has(`${setPart.part_id}-${setPart.color_id}`);
            return matchesSearch && (!showOnlyMissing || isMissing);
        });
    }, [set?.set_parts, searchTerm, showOnlyMissing, missingByIdentity]);

    const totalParts = set?.set_parts?.reduce((sum, part) => sum + part.quantity, 0) || 0;
    const missingPartsCount = missingParts.reduce((sum, part) => sum + part.quantity, 0);
    const completedParts = Math.max(0, totalParts - missingPartsCount);
    const completionPercentage = totalParts > 0 ? Math.floor((completedParts / totalParts) * 100) : 0;

    const refreshMissingParts = async () => {
        if (!set) return;
        const response = await missingPartsApi.getBySetId(set.id);
        setMissingParts(response.data);
    };

    const refreshPhotos = async () => {
        if (!set) return;
        const response = await setPhotosApi.list(set.id);
        setPhotos(response.data.photos || []);
    };

    const saveNotes = async () => {
        if (!set) return;
        try {
            setSaving(true);
            setError(null);
            const response = await setsApi.updateNotes(set.id, notesForm);
            setSet({ ...set, ...response.data });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const uploadPhoto = async () => {
        if (!set || !photoFile) return;
        try {
            setSaving(true);
            setError(null);
            await setPhotosApi.upload(set.id, photoFile, { title: photoTitle, photo_type: photoType, is_primary: photos.length === 0 });
            setPhotoFile(null);
            setPhotoTitle('');
            setPhotoType('other');
            await refreshPhotos();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const setPrimaryPhoto = async (photo: SetPhoto) => {
        if (!set) return;
        try {
            setSaving(true);
            setError(null);
            await setPhotosApi.update(set.id, photo.id, { is_primary: true });
            await refreshPhotos();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const deletePhoto = async (photo: SetPhoto) => {
        if (!set) return;
        try {
            setSaving(true);
            setError(null);
            await setPhotosApi.delete(set.id, photo.id);
            await refreshPhotos();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const submitMissingPart = async () => {
        if (!set || !missingModal) return;
        try {
            setSaving(true);
            setError(null);
            await missingPartsApi.assign({
                set_id: set.id,
                part_requests: [{ set_part_id: missingModal.setPart.id, quantity: missingModal.quantity }],
            });
            await refreshMissingParts();
            setMissingModal(null);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const submitEditMissingPart = async () => {
        if (!editModal) return;
        try {
            setSaving(true);
            setError(null);
            await missingPartsApi.update(editModal.missingPart.id, { quantity: editModal.quantity, notes: editModal.notes });
            await refreshMissingParts();
            setEditModal(null);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const markAsFound = async (missingPartId: number) => {
        try {
            setSaving(true);
            setError(null);
            await missingPartsApi.delete(missingPartId);
            await refreshMissingParts();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const deleteSet = async () => {
        if (!set) return;
        try {
            setSaving(true);
            await setsApi.delete(set.id);
            navigate('/sets');
        } catch (err) {
            setError(getApiErrorMessage(err));
            setSaving(false);
        }
    };

    if (loading) return <Spinner label="Loading set" />;

    if (!set) {
        return <ErrorBanner message={error || 'Set not found'} action={<Link to="/sets"><Button size="sm">Back to sets</Button></Link>} />;
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link to="/sets"><Button variant="ghost"><ArrowLeft className="h-4 w-4" />Back to Sets</Button></Link>
                <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)} disabled={saving}><Trash2 className="h-4 w-4" />Delete Set</Button>
            </div>

            {error && <ErrorBanner message={error} action={<Button size="sm" onClick={() => setError(null)}>Dismiss</Button>} />}

            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid gap-5 lg:grid-cols-[12rem_1fr]">
                    <button className="h-48 w-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-950" onClick={() => { setLightboxImage(set.set_img_url); setLightboxAlt(set.name); setLightboxOpen(true); }} aria-label={`Open image for ${set.name}`}>
                        {set.set_img_url ? <img src={set.set_img_url} alt={set.name} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-10 w-10 text-slate-400" />}
                    </button>
                    <div className="min-w-0">
                        <PageHeader
                            title={set.name}
                            description={`Set ${set.set_num}`}
                            actions={
                                <>
                                    <AnchorButton size="sm" href={`https://www.lego.com/en-be/service/building-instructions/${set.set_num.replace(/-1$/, '')}`} target="_blank" rel="noopener noreferrer"><BookOpen className="h-4 w-4" />Instructions</AnchorButton>
                                    <Link to="/shopping-list"><Button size="sm"><ClipboardList className="h-4 w-4" />Shopping List</Button></Link>
                                </>
                            }
                        />
                        <div className="mb-5 flex flex-wrap gap-2">
                            <Badge variant="primary">#{set.set_num}</Badge>
                            <Badge>{set.year}</Badge>
                            <Badge>{set.num_parts} catalog parts</Badge>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <StatTile label="Total Parts" value={totalParts} tone="primary" />
                            <StatTile label="Missing" value={missingPartsCount} tone="danger" />
                            <StatTile label="Complete" value={`${completionPercentage}%`} tone="success" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-neutral-50"><Camera className="h-4 w-4 text-amber-500" />Notes & Photos</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">Track storage, build status, notes, and personal photos for this set.</p>
                    </div>
                    <Button size="sm" variant="primary" onClick={saveNotes} disabled={saving}><Save className="h-4 w-4" />Save Notes</Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">Build status
                            <select className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={notesForm.build_status} onChange={(event) => setNotesForm({ ...notesForm, build_status: event.target.value as BuildStatus })}>
                                {buildStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </label>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Storage location</span>
                            <Input className="mt-1" value={notesForm.storage_location} onChange={(event) => setNotesForm({ ...notesForm, storage_location: event.target.value })} placeholder="Shelf, box, room..." />
                        </label>
                        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">Notes
                            <Textarea className="mt-1" value={notesForm.notes} onChange={(event) => setNotesForm({ ...notesForm, notes: event.target.value })} placeholder="Box condition, missing bags, sorting notes..." />
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-neutral-700">
                            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                                <Input type="text" value={photoTitle} onChange={(event) => setPhotoTitle(event.target.value)} placeholder="Photo title" />
                                <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={photoType} onChange={(event) => setPhotoType(event.target.value as PhotoType)}>
                                    {photoTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
                                <Button onClick={uploadPhoto} disabled={saving || !photoFile}><Upload className="h-4 w-4" />Upload</Button>
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">JPEG, PNG or WebP up to the configured backend limit.</p>
                        </div>

                        {photos.length === 0 ? (
                            <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500 dark:border-neutral-800 dark:text-neutral-400">No personal photos yet.</div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950">
                                        <button className="block aspect-video w-full bg-neutral-100 dark:bg-neutral-900" onClick={() => { setLightboxImage(resolveAssetUrl(photo.url)); setLightboxAlt(photo.title || photo.original_name); setLightboxOpen(true); }}>
                                            <img src={resolveAssetUrl(photo.url)} alt={photo.title || photo.original_name} className="h-full w-full object-cover" />
                                        </button>
                                        <div className="space-y-2 p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium text-slate-950 dark:text-neutral-50">{photo.title || photo.original_name}</div>
                                                    <div className="text-xs capitalize text-slate-500 dark:text-neutral-400">{photo.photo_type}</div>
                                                </div>
                                                {photo.is_primary && <Badge variant="warning">Primary</Badge>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => setPrimaryPhoto(photo)} disabled={saving || photo.is_primary}><Star className="h-4 w-4" />Primary</Button>
                                                <Button size="sm" variant="danger" onClick={() => deletePhoto(photo)} disabled={saving}><Trash2 className="h-4 w-4" />Delete</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {missingParts.length > 0 && (
                <section className="mb-6 rounded-lg border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-red-800 dark:text-red-100">Missing Parts ({missingParts.length})</h2>
                        <Link to="/shopping-list"><Button size="sm"><ClipboardList className="h-4 w-4" />View List</Button></Link>
                    </div>
                    <div className="grid gap-3">
                        {missingParts.map((missingPart) => (
                            <div key={missingPart.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="h-14 w-14 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-950">
                                        {missingPart.part?.part_img_url ? <img src={missingPart.part.part_img_url} alt={missingPart.part?.name || ''} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-6 w-6 text-slate-400" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-slate-950 dark:text-neutral-50">{missingPart.part?.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-neutral-400">#{missingPart.part?.part_num} - {missingPart.color_name}</div>
                                        {missingPart.notes && <div className="mt-1 text-sm text-slate-700 dark:text-neutral-300">{missingPart.notes}</div>}
                                    </div>
                                    <Badge variant="danger">{missingPart.quantity} missing</Badge>
                                    <div className="flex flex-wrap gap-2">
                                        <Button size="sm" onClick={() => setEditModal({ missingPart, quantity: missingPart.quantity, notes: missingPart.notes || '' })}>Edit</Button>
                                        <Button size="sm" variant="success" onClick={() => markAsFound(missingPart.id)} disabled={saving}><PackageCheck className="h-4 w-4" />Found</Button>
                                        <AnchorButton size="sm" href={legoPickABrickUrl(missingPart.part?.part_num || '')} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" />Buy</AnchorButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-neutral-50">All Parts ({set.set_parts?.length || 0})</h2>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input className="pl-9" placeholder="Search parts..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                        </div>
                        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-neutral-700 dark:text-neutral-300">
                            <Checkbox checked={showOnlyMissing} onChange={(event) => setShowOnlyMissing(event.target.checked)} />Only missing
                        </label>
                    </div>
                </div>

                {filteredParts.length === 0 ? (
                    <EmptyState icon={<Search className="h-6 w-6" />} title="No parts match" description="Try adjusting your part search or missing-only filter." />
                ) : (
                    <TableShell>
                        <thead className={tableHeaderClass}><tr><th className={`${tableCellClass} w-[48%]`}>Part</th><th className={`${tableCellClass} w-[18%]`}>Color</th><th className={`${tableCellClass} w-24`}>Qty</th><th className={`${tableCellClass} w-28`}>Status</th><th className={`${tableActionHeaderClass} w-36`}>Actions</th></tr></thead>
                        <tbody>
                            {filteredParts.map((setPart) => {
                                const missingPart = missingByIdentity.get(`${setPart.part_id}-${setPart.color_id}`);
                                return (
                                    <tr key={setPart.id} className={tableRowClass}>
                                        <td className={tableCellClass}>
                                            <div className="flex items-center gap-3">
                                                <button className="h-11 w-11 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-950" onClick={() => { setLightboxImage(setPart.part?.part_img_url || ''); setLightboxAlt(setPart.part?.name || ''); setLightboxOpen(true); }} aria-label={`Open image for ${setPart.part?.name || 'part'}`}>
                                                    {setPart.part?.part_img_url ? <img src={setPart.part.part_img_url} alt={setPart.part?.name || ''} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-5 w-5 text-slate-400" />}
                                                </button>
                                                <div className="min-w-0"><div className="truncate font-medium text-slate-950 dark:text-neutral-50">{setPart.part?.name}</div><div className="text-xs text-slate-500 dark:text-neutral-400">#{setPart.part?.part_num}</div></div>
                                            </div>
                                        </td>
                                        <td className={tableCellClass}><div className="flex items-center gap-2"><span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ backgroundColor: `#${setPart.color_hex || 'FFFFFF'}` }} />{setPart.color_name}</div></td>
                                        <td className={tableCellClass}><Badge>{setPart.quantity}</Badge></td>
                                        <td className={tableCellClass}>{missingPart ? <Badge variant="danger">{missingPart.quantity} missing</Badge> : <Badge variant="success">Complete</Badge>}</td>
                                        <td className={tableActionCellClass}>{missingPart ? <Button size="sm" onClick={() => setEditModal({ missingPart, quantity: missingPart.quantity, notes: missingPart.notes || '' })}>Edit</Button> : <Button size="sm" variant="warning" onClick={() => setMissingModal({ setPart, quantity: 1 })}>Mark Missing</Button>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </TableShell>
                )}
            </section>

            {missingModal && (
                <Modal
                    title="Mark Missing"
                    onClose={() => setMissingModal(null)}
                    footer={<><Button variant="ghost" onClick={() => setMissingModal(null)}>Cancel</Button><Button variant="primary" onClick={submitMissingPart} disabled={saving || missingModal.quantity < 1 || missingModal.quantity > missingModal.setPart.quantity}>Save</Button></>}
                >
                    <p className="mb-3 text-sm text-slate-500 dark:text-neutral-400">{missingModal.setPart.part?.name} - max {missingModal.setPart.quantity}</p>
                    <Input type="number" min={1} max={missingModal.setPart.quantity} value={missingModal.quantity} onChange={(event) => setMissingModal({ ...missingModal, quantity: Number(event.target.value) })} />
                </Modal>
            )}

            {editModal && (
                <Modal
                    title="Edit Missing Part"
                    onClose={() => setEditModal(null)}
                    footer={<><Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button><Button variant="primary" onClick={submitEditMissingPart} disabled={saving || editModal.quantity < 1}>Save</Button></>}
                >
                    <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-neutral-300">Quantity<Input className="mt-1" type="number" min={1} value={editModal.quantity} onChange={(event) => setEditModal({ ...editModal, quantity: Number(event.target.value) })} /></label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">Notes<Textarea className="mt-1" value={editModal.notes} onChange={(event) => setEditModal({ ...editModal, notes: event.target.value })} /></label>
                </Modal>
            )}

            {confirmDeleteOpen && (
                <Modal
                    title="Delete Set"
                    onClose={() => setConfirmDeleteOpen(false)}
                    footer={<><Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button><Button variant="danger" onClick={deleteSet} disabled={saving}>Delete</Button></>}
                >
                    <p className="text-sm text-slate-600 dark:text-neutral-300">Delete "{set.name}" from your collection?</p>
                </Modal>
            )}

            <ImageLightbox imageUrl={lightboxImage || ''} alt={lightboxAlt} open={lightboxOpen} onClose={() => { setLightboxOpen(false); setLightboxImage(null); setLightboxAlt(''); }} />
        </div>
    );
}
