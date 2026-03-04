'use client';

import { useState } from 'react';
import { updateProfile } from './actions';

export default function ProfileClient({ user }: { user: any }) {
    const [firstName, setFirstName] = useState(user.first_name);
    const [lastName, setLastName] = useState(user.last_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);
        try {
            await updateProfile({ first_name: firstName, last_name: lastName, phone_number: phoneNumber });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-32 lg:pb-12 bg-[#FDFCFB] min-h-[100dvh]">
            <header className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2D3748] mb-1">
                    Profile Settings
                </h1>
                <p className="text-[#718096] text-lg">Manage your personal information.</p>
            </header>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-slate-100">
                <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
                    <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden shrink-0 border-4 border-slate-50 shadow-sm relative group">
                        {user.profile_photo ? (
                            <img src={user.profile_photo.startsWith('/uploads') ? `/api/avatar/${user.profile_photo.split('/').pop()}` : user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-semibold">Ready</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{user.first_name} {user.last_name}</h2>
                        <p className="text-slate-500 text-sm mt-1">{user.email}</p>
                        <div className="mt-2 inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md uppercase tracking-wide">
                            {user.role}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-semibold border ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
