'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { createAlert } from './actions';

export default function AlertClient({ initialAlerts, currentUser }: { initialAlerts: any[], currentUser: any }) {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [isPosting, setIsPosting] = useState(false);
    const [content, setContent] = useState('');
    const [type, setType] = useState('NOTICE');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const newAlert = await createAlert(content, type);
            setAlerts(prev => [newAlert, ...prev]);
            setContent('');
            setType('NOTICE');
        } catch (error) {
            console.error("Failed to post alert", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-32 lg:pb-12 min-h-screen bg-[#FDFCFB]">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2D3748] mb-1">
                    Building Alerts
                </h1>
                <p className="text-[#718096] text-lg">Broadcasts and notifications from the community.</p>
            </header>

            {/* Creation Form for ALL residents */}
            <form onSubmit={handleCreate} className="mb-8 bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-800">Post an Alert</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="text-xs font-bold uppercase tracking-wider bg-slate-50 border-none outline-none focus:ring-0 text-slate-600 cursor-pointer rounded-lg px-2 py-1"
                    >
                        <option value="NOTICE">Notice</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="EVENT">Event</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="What's happening in the building? (e.g., Water shut off, Package found)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-sm text-slate-800 resize-none"
                    rows={3}
                    maxLength={300}
                />
                <button
                    type="submit"
                    disabled={isPosting || !content.trim()}
                    className="Self-end w-full lg:w-auto ml-auto bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                    {isPosting ? 'Broadcasting...' : 'Broadcast Alert'}
                </button>
            </form>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <article key={alert.id} className={`bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border-l-4 ${alert.priority > 1 ? 'border-l-amber-500' : 'border-l-green-600'} border-y border-y-slate-100 border-r border-r-slate-100`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold text-sm tracking-wide uppercase ${alert.priority > 1 ? 'text-amber-700' : 'text-green-800'}`}>
                                {alert.type}
                            </span>
                            <time className="text-xs text-slate-500 font-medium">
                                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </time>
                        </div>
                        <p className="text-[#2D3748] font-medium leading-relaxed mb-4 text-[15px]">
                            {alert.content}
                        </p>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {alert.author.profile_photo ? (
                                    <img src={alert.author.profile_photo.startsWith('/uploads') ? `/api/avatar/${alert.author.profile_photo.split('/').pop()}` : alert.author.profile_photo} alt="" className="w-full h-full object-cover" />
                                ) : '👤'}
                            </div>
                            <span>
                                Posted by {alert.author.first_name} {alert.author.last_name}
                                {alert.author.role === 'manager' && <span className="text-amber-700 ml-1.5 bg-amber-50 px-1.5 py-0.5 rounded-md">(Manager)</span>}
                            </span>
                        </div>
                    </article>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-16 px-6 bg-white/50 rounded-3xl border border-dashed border-slate-200 shadow-sm mt-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                            <span className="text-2xl">🔔</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-1">No active alerts</h3>
                        <p className="text-slate-500 text-sm">Everything is quiet and running smoothly.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
