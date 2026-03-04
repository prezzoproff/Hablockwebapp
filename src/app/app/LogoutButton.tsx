'use client';

import { useTransition } from 'react';
import { logoutUser } from './actions';

export function LogoutButton({ variant }: { variant: 'sidebar' | 'icon' }) {
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(() => {
            logoutUser();
        });
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleLogout}
                disabled={isPending}
                className="text-slate-400 hover:text-red-600 transition-colors opacity-80"
                title="Log out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            {isPending ? 'Signing out...' : 'Log out'}
        </button>
    );
}
