import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Download, ExternalLink, ImageIcon, Search } from 'lucide-react';
import { missingPartsApi, getApiErrorMessage } from '../../services/api';
import type { ShoppingListItem } from '../../types/api';
import { AnchorButton, Badge, Button, EmptyState, ErrorBanner, Input, PageHeader, Spinner, StatTile, TableShell, tableActionCellClass, tableActionHeaderClass, tableCellClass, tableHeaderClass, tableRowClass } from '../../components/ui';

const legoPickABrickUrl = (partNum: string) =>
    `https://www.lego.com/en-be/pick-and-build/pick-a-brick?icmp=PAB_All_Pieces&query=${encodeURIComponent(partNum)}`;

export default function ShoppingListPage() {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await missingPartsApi.shoppingList();
                setItems(response.data.items || []);
            } catch (err) {
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const filteredItems = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return items.filter((item) =>
            item.part_name.toLowerCase().includes(term) ||
            item.part_num.toLowerCase().includes(term) ||
            item.color_name.toLowerCase().includes(term) ||
            item.set_names.toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.total_quantity, 0);

    const exportCsv = () => {
        const rows = [
            ['Part number', 'Part name', 'Color', 'Color ID', 'Quantity', 'Sets', 'LEGO Pick a Brick URL'],
            ...filteredItems.map((item) => [
                item.part_num,
                item.part_name,
                item.color_name,
                String(item.color_id),
                String(item.total_quantity),
                item.set_names,
                legoPickABrickUrl(item.part_num),
            ]),
        ];
        const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'missingbrick-shopping-list.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <Spinner label="Loading shopping list" />;

    return (
        <div>
            <PageHeader
                title="Shopping List"
                description="Aggregated missing parts across your collection."
                actions={<Button onClick={exportCsv} disabled={filteredItems.length === 0}><Download className="h-4 w-4" />Export CSV</Button>}
            />

            {error && <ErrorBanner message={error} />}

            <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-9" placeholder="Search parts, colors, or sets..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
                <StatTile label="Unique parts" value={filteredItems.length} tone="primary" />
                <StatTile label="Total quantity" value={totalQuantity} tone="success" />
            </div>

            {filteredItems.length === 0 ? (
                <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No missing parts" description="Mark parts as missing from a set to build a shopping list." />
            ) : (
                <TableShell>
                    <thead className={tableHeaderClass}>
                        <tr>
                            <th className={tableCellClass}>Part</th>
                            <th className={tableCellClass}>Color</th>
                            <th className={tableCellClass}>Quantity</th>
                            <th className={tableCellClass}>Sets</th>
                            <th className={tableActionHeaderClass}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={`${item.part_id}-${item.color_id}`} className={tableRowClass}>
                                <td className={tableCellClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-neutral-800 dark:bg-neutral-950">
                                            {item.part_img_url ? <img src={item.part_img_url} alt={item.part_name} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-5 w-5 text-slate-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-slate-950 dark:text-neutral-50">{item.part_name}</div>
                                            <div className="text-xs text-slate-500 dark:text-neutral-400">#{item.part_num}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={tableCellClass}>
                                    <div className="flex items-center gap-2"><span className="inline-block h-4 w-4 rounded border border-slate-300" style={{ backgroundColor: `#${item.color_hex || 'FFFFFF'}` }} />{item.color_name}</div>
                                </td>
                                <td className={tableCellClass}><Badge variant="primary">{item.total_quantity}</Badge></td>
                                <td className={`${tableCellClass} max-w-xs whitespace-normal text-slate-600 dark:text-neutral-300`}>{item.set_names}</td>
                                <td className={tableActionCellClass}>
                                    <AnchorButton size="sm" href={legoPickABrickUrl(item.part_num)} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" />Buy</AnchorButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableShell>
            )}
        </div>
    );
}
