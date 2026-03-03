'use client';

import { useState, useCallback } from 'react';
import { Application } from '@prisma/client';
import { StatusBadge } from './StatusBadge';
import { ApplicationModal } from './ApplicationModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ChevronUp,
    ChevronDown,
    Filter,
    ClipboardList,
    Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApplicationsTableProps {
    initialApplications: Application[];
}

const ALL_STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];

export function ApplicationsTable({ initialApplications }: ApplicationsTableProps) {
    const router = useRouter();
    const [applications, setApplications] = useState(initialApplications);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

    const fetchApplications = useCallback(async () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter !== 'All') params.set('status', statusFilter);

        const res = await fetch(`/api/applications?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setApplications(data);
        }
        router.refresh();
    }, [search, statusFilter, router]);

    function handleSort(field: string) {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }

    const filtered = applications
        .filter((app) => {
            const matchSearch = app.companyName
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchStatus =
                statusFilter === 'All' || app.status === statusFilter;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => {
            if (sortField === 'createdAt') {
                const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                return sortDir === 'asc' ? diff : -diff;
            }
            const aVal = (a as any)[sortField] ?? '';
            const bVal = (b as any)[sortField] ?? '';
            const cmp = aVal.localeCompare(bVal);
            return sortDir === 'asc' ? cmp : -cmp;
        });

    function SortIcon({ field }: { field: string }) {
        if (sortField !== field) return null;
        return sortDir === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
        ) : (
            <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
        );
    }

    return (
        <>
            <div className="card">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-white">Applications</h2>
                    <button
                        id="add-application-btn"
                        onClick={() => {
                            setEditingApp(null);
                            setModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            id="search-input"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-9"
                            placeholder="Search by company..."
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field pl-9 pr-8 w-full sm:w-40"
                        >
                            {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No applications found</p>
                        <p className="text-sm mt-1 text-slate-600">
                            {search || statusFilter !== 'All'
                                ? 'Try adjusting your filters'
                                : 'Click "Add Application" to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    {[
                                        { label: 'Company', field: 'companyName' },
                                        { label: 'Role', field: 'role' },
                                        { label: 'Status', field: 'status' },
                                        { label: 'Interview Date', field: 'interviewDate' },
                                        { label: 'Applied On', field: 'createdAt' },
                                    ].map(({ label, field }) => (
                                        <th
                                            key={field}
                                            className="text-left text-slate-400 font-medium pb-3 pr-4 cursor-pointer hover:text-slate-200 transition-colors select-none"
                                            onClick={() => handleSort(field)}
                                        >
                                            {label}
                                            <SortIcon field={field} />
                                        </th>
                                    ))}
                                    <th className="text-left text-slate-400 font-medium pb-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filtered.map((app) => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="py-3.5 pr-4 font-medium text-white">
                                            {app.companyName}
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-300">{app.role}</td>
                                        <td className="py-3.5 pr-4">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-400">
                                            {app.interviewDate
                                                ? new Date(app.interviewDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '—'}
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-400">
                                            {new Date(app.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    id={`view-${app.id}`}
                                                    href={`/dashboard/applications/${app.id}`}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                                                    title="View & Optimize Resume"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    id={`edit-${app.id}`}
                                                    onClick={() => {
                                                        setEditingApp(app);
                                                        setModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-400/10 rounded-md transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    id={`delete-${app.id}`}
                                                    onClick={() => setDeleteTarget(app)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="text-xs text-slate-600 mt-4">
                            Showing {filtered.length} of {applications.length} applications
                        </p>
                    </div>
                )}
            </div>

            <ApplicationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchApplications}
                application={editingApp}
            />

            {deleteTarget && (
                <DeleteConfirmDialog
                    isOpen={!!deleteTarget}
                    companyName={deleteTarget.companyName}
                    applicationId={deleteTarget.id}
                    onClose={() => setDeleteTarget(null)}
                    onSuccess={fetchApplications}
                />
            )}
        </>
    );
}
