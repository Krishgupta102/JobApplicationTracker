'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    companyName: string;
    applicationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteConfirmDialog({
    isOpen,
    companyName,
    applicationId,
    onClose,
    onSuccess,
}: DeleteConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const res = await fetch(`/api/applications/${applicationId}`, {
            method: 'DELETE',
        });
        setLoading(false);

        if (res.ok) {
            onSuccess();
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm card animate-slide-up z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Delete Application</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-slate-400 text-sm mb-6">
                    Are you sure you want to delete the application for{' '}
                    <span className="text-white font-medium">{companyName}</span>? This
                    action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button
                        id="confirm-delete-btn"
                        onClick={handleDelete}
                        disabled={loading}
                        className="btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
