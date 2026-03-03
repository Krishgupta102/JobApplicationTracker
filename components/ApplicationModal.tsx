'use client';

import { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '@prisma/client';
import { X, Loader2 } from 'lucide-react';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    application?: Application | null;
}

const STATUSES: ApplicationStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected'];

const defaultForm = {
    companyName: '',
    role: '',
    status: 'Applied' as ApplicationStatus,
    interviewDate: '',
    notes: '',
};

export function ApplicationModal({
    isOpen,
    onClose,
    onSuccess,
    application,
}: ApplicationModalProps) {
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!application;

    useEffect(() => {
        if (application) {
            setForm({
                companyName: application.companyName,
                role: application.role,
                status: application.status,
                interviewDate: application.interviewDate
                    ? new Date(application.interviewDate).toISOString().split('T')[0]
                    : '',
                notes: application.notes ?? '',
            });
        } else {
            setForm(defaultForm);
        }
        setError('');
    }, [application, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...form,
            interviewDate: form.interviewDate || null,
            notes: form.notes || null,
        };

        const url = isEdit
            ? `/api/applications/${application!.id}`
            : '/api/applications';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || 'Something went wrong.');
        } else {
            onSuccess();
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md card animate-slide-up z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        {isEdit ? 'Edit Application' : 'Add Application'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-2.5 text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Company Name *
                        </label>
                        <input
                            id="modal-company"
                            type="text"
                            value={form.companyName}
                            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                            className="input-field"
                            placeholder="e.g. Google"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Role *
                        </label>
                        <input
                            id="modal-role"
                            type="text"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="input-field"
                            placeholder="e.g. Software Engineer"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Status *
                        </label>
                        <select
                            id="modal-status"
                            value={form.status}
                            onChange={(e) =>
                                setForm({ ...form, status: e.target.value as ApplicationStatus })
                            }
                            className="input-field"
                            required
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Interview Date
                        </label>
                        <input
                            id="modal-interview-date"
                            type="date"
                            value={form.interviewDate}
                            onChange={(e) =>
                                setForm({ ...form, interviewDate: e.target.value })
                            }
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Notes
                        </label>
                        <textarea
                            id="modal-notes"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            id="modal-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isEdit ? (
                                'Update'
                            ) : (
                                'Add Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
