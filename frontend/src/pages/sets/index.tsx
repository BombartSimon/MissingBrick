import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, Filter, ImageIcon, PackagePlus, Search, SlidersHorizontal } from 'lucide-react';
import { getApiErrorMessage, missingPartsApi, setsApi } from '../../services/api';
import type { MissingPart, RebrickableSet, Set } from '../../types/api';
import ImageLightbox from '../../components/ImageLightbox';
import SetSearch from '../../components/SetSearch';
import { AnchorButton, Badge, Button, Checkbox, EmptyState, ErrorBanner, Input, PageHeader, Select, Spinner } from '../../components/ui';

type SortKey = 'name' | 'year' | 'completion';

export default function SetsPage() {
    const navigate = useNavigate();
    const [sets, setSets] = useState<Set[]>([]);
    const [missingParts, setMissingParts] = useState<MissingPart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [incompleteOnly, setIncompleteOnly] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedRebrickableSet, setSelectedRebrickableSet] = useState<RebrickableSet | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [setsResponse, missingResponse] = await Promise.all([
                setsApi.getAll(),
                missingPartsApi.getAll().catch(() => ({ data: { missing_parts: [] as MissingPart[] } })),
            ]);
            setSets(setsResponse.data?.sets || []);
            setMissingParts(missingResponse.data?.missing_parts || []);
        } catch (err) {
            setError(getApiErrorMessage(err));
            setSets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const missingBySet = useMemo(() => {
        return missingParts.reduce<Record<number, number>>((acc, part) => {
            acc[part.set_id] = (acc[part.set_id] || 0) + part.quantity;
            return acc;
        }, {});
    }, [missingParts]);

    const visibleSets = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return [...sets]
            .filter((set) => {
                const matchesSearch = set.name.toLowerCase().includes(term) || set.set_num.toLowerCase().includes(term);
                const matchesYear = yearFilter === '' || set.year.toString() === yearFilter;
                const matchesIncomplete = !incompleteOnly || (missingBySet[set.id] || 0) > 0;
                return matchesSearch && matchesYear && matchesIncomplete;
            })
            .sort((a, b) => {
                if (sortKey === 'year') return b.year - a.year || a.name.localeCompare(b.name);
                if (sortKey === 'completion') return (missingBySet[b.id] || 0) - (missingBySet[a.id] || 0);
                return a.name.localeCompare(b.name);
            });
    }, [sets, searchTerm, yearFilter, incompleteOnly, sortKey, missingBySet]);

    const uniqueYears = [...new Set(sets.map((set) => set.year))].sort((a, b) => b - a);
    const totalMissing = missingParts.reduce((sum, part) => sum + part.quantity, 0);

    const handleCreateSet = async (rebrickableSet: RebrickableSet) => {
        try {
            setIsAdding(true);
            setError(null);
            setSelectedRebrickableSet(rebrickableSet);
            await setsApi.create({ set_num: rebrickableSet.set_num });
            await fetchData();
            setSelectedRebrickableSet(null);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) return <Spinner label="Loading sets" />;

    return (
        <div>
            <PageHeader
                title="Sets"
                description={`${sets.length} sets tracked - ${totalMissing} missing parts`}
                actions={<Link to="/shopping-list"><Button><ClipboardList className="h-4 w-4" />Shopping List</Button></Link>}
            />

            {error && <ErrorBanner message={error} action={<Button size="sm" onClick={fetchData}>Retry</Button>} />}

            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-neutral-50">
                    <PackagePlus className="h-4 w-4 text-amber-600" />Add set from Rebrickable
                </div>
                <div className="flex flex-col gap-3">
                    <SetSearch onSelectSet={handleCreateSet} placeholder="Search LEGO sets by name or number..." disabled={isAdding} />
                    {selectedRebrickableSet && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 overflow-hidden rounded-md border border-amber-200 bg-white dark:border-amber-900 dark:bg-neutral-900">
                                    {selectedRebrickableSet.set_img_url && <img src={selectedRebrickableSet.set_img_url} alt={selectedRebrickableSet.name} className="h-full w-full object-cover" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate font-medium text-slate-950 dark:text-neutral-50">{selectedRebrickableSet.name}</div>
                                    <div className="text-sm text-slate-600 dark:text-neutral-300">#{selectedRebrickableSet.set_num} - {selectedRebrickableSet.year} - {selectedRebrickableSet.num_parts} parts</div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-200">Adding this set and importing parts...</div>
                        </div>
                    )}
                </div>
            </section>

            <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem_auto]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input className="pl-9" placeholder="Search sets..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                    </div>
                    <Select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} aria-label="Filter by year">
                        <option value="">All years</option>
                        {uniqueYears.map((year) => <option key={year} value={year}>{year}</option>)}
                    </Select>
                    <Select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} aria-label="Sort sets">
                        <option value="name">Sort by name</option>
                        <option value="year">Sort by year</option>
                        <option value="completion">Sort by missing</option>
                    </Select>
                    <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-neutral-700 dark:text-neutral-300">
                        <Checkbox checked={incompleteOnly} onChange={(event) => setIncompleteOnly(event.target.checked)} />
                        <Filter className="h-4 w-4" />Incomplete
                    </label>
                </div>
            </section>

            {visibleSets.length === 0 ? (
                <EmptyState icon={<SlidersHorizontal className="h-6 w-6" />} title={sets.length === 0 ? 'No sets yet' : 'No sets found'} description={sets.length === 0 ? 'Add your first LEGO set to start building your inventory.' : 'Try adjusting your search or filters.'} />
            ) : (
                <div className="grid gap-3">
                    {visibleSets.map((set) => {
                        const missingCount = missingBySet[set.id] || 0;
                        const completion = set.num_parts > 0 ? Math.max(0, Math.floor(((set.num_parts - missingCount) / set.num_parts) * 100)) : 100;
                        return (
                            <article key={set.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-slate-700">
                                <div className="grid gap-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
                                    <button className="h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-950" onClick={() => { setLightboxImage(set.set_img_url); setLightboxAlt(set.name); setLightboxOpen(true); }} aria-label={`Open image for ${set.name}`}>
                                        {set.set_img_url ? <img src={set.set_img_url} alt={set.name} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-8 w-8 text-slate-400" />}
                                    </button>
                                    <div className="min-w-0">
                                        <button className="block truncate text-left text-lg font-semibold text-slate-950 hover:text-amber-700 dark:text-neutral-50 dark:hover:text-amber-300" onClick={() => navigate(`/sets/${set.id}`)}>{set.name}</button>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <Badge variant="primary">#{set.set_num}</Badge>
                                            <Badge>{set.year}</Badge>
                                            <span className="text-sm text-slate-500 dark:text-neutral-400">{set.num_parts} parts</span>
                                            {missingCount > 0 ? <Badge variant="danger">{missingCount} missing</Badge> : <Badge variant="success">Complete</Badge>}
                                        </div>
                                        <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completion}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:flex-col">
                                        <Button variant="primary" size="sm" onClick={() => navigate(`/sets/${set.id}`)}>Open</Button>
                                        <AnchorButton size="sm" href={`https://www.lego.com/en-be/service/building-instructions/${encodeURIComponent(set.set_num.replace(/-1$/, ''))}`} target="_blank" rel="noopener noreferrer"><BookOpen className="h-4 w-4" />Instructions</AnchorButton>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <ImageLightbox imageUrl={lightboxImage || ''} alt={lightboxAlt} open={lightboxOpen} onClose={() => { setLightboxOpen(false); setLightboxImage(null); setLightboxAlt(''); }} />
        </div>
    );
}
