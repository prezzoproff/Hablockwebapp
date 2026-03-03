'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { submitChatMessage, syncCommunityState } from './actions';
import { format } from 'date-fns';

function createToast(container: HTMLElement | null, icon: string, label: string, labelColor: string, body: string, bgClass: string, borderClass: string, duration: number) {
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `${bgClass} shadow-xl rounded-2xl p-4 flex gap-3 items-center w-full max-w-sm animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${borderClass}`;

    const iconEl = document.createElement('div');
    iconEl.className = "text-2xl shrink-0";
    iconEl.textContent = icon;

    const textWrap = document.createElement('div');
    const labelEl = document.createElement('p');
    labelEl.className = `text-xs font-bold ${labelColor}`;
    labelEl.textContent = label;
    const bodyEl = document.createElement('p');
    bodyEl.className = "text-sm font-medium text-slate-800 line-clamp-1";
    bodyEl.textContent = body;

    textWrap.appendChild(labelEl);
    textWrap.appendChild(bodyEl);
    toast.appendChild(iconEl);
    toast.appendChild(textWrap);
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out', 'slide-out-to-top-4'); setTimeout(() => toast.remove(), 300); }, duration);
}

export default function FeedClient({ initialPosts, currentUser }: { initialPosts: any[], currentUser: any }) {
    const [posts, setPosts] = useState(initialPosts);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [posts]);

    // Polling Mechanism every 5 seconds for absolute native real-time emulation
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await syncCommunityState(lastChecked);
                if (data.posts.length > 0 || data.alerts.length > 0 || data.newUsers > 0) {
                    setLastChecked(new Date());

                    // Dispatch toasts natively into DOM container defined in Layout
                    const container = document.getElementById('hablock-toast-container');

                    if (data.posts.length > 0) {
                        // Filter out my own posts that I already appended optimistically
                        const othersPosts = data.posts.filter(p => p.author.id !== currentUser.id);
                        if (othersPosts.length > 0) {
                            setPosts(prev => {
                                const newUniques = othersPosts.filter(op => !prev.find(p => p.id === op.id));
                                return [...prev, ...newUniques];
                            });

                            othersPosts.forEach(p => {
                                createToast(container, '💬', 'New Message', 'text-green-800', `${p.author.first_name}: ${p.content}`, 'bg-white', 'border border-slate-100', 4000);
                            });
                        }
                    }

                    if (data.newUsers > 0) {
                        createToast(container, '🎉', 'Community Growth', 'text-green-800', `${data.newUsers} new resident(s) joined Hablock!`, 'bg-green-50', 'border border-green-200', 5000);
                    }

                    if (data.alerts.length > 0) {
                        data.alerts.forEach(a => {
                            createToast(container, '🔔', 'Building Alert', 'text-amber-800', a.content, 'bg-amber-50', 'border border-amber-200', 5000);
                        });
                    }
                }
            } catch (err) {
                console.error("Sync error", err);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [lastChecked, currentUser.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        const content = message.trim();
        setMessage('');
        setIsSending(true);

        const optimisticPost = {
            id: 'temp-' + Date.now(),
            content,
            created_at: new Date().toISOString(),
            author: {
                id: currentUser.id,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                role: currentUser.role,
                profile_photo: currentUser.profile_photo,
                verified: currentUser.verified
            }
        };

        setPosts(prev => [...prev, optimisticPost]);

        try {
            const actualPost = await submitChatMessage(content);
            setPosts(prev => prev.map(p => p.id === optimisticPost.id ? actualPost : p));
        } catch (err) {
            console.error("Failed to send message", err);
            // Revert on fail
            setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] lg:h-screen lg:pt-0 pt-16 bg-[#FDFCFB]">
            {/* Header locked to top */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-10 sticky top-0 lg:static">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#2D3748]">Community Lounge</h1>
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Encrypted
                    </p>
                </div>
                <div className="flex -space-x-2">
                    {/* Placeholder for active avatars */}
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white z-20 overflow-hidden"><img src={currentUser.profile_photo || ''} className="w-full h-full object-cover" /></div>
                    <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white z-10 flex items-center justify-center text-[10px] text-white font-bold">+</div>
                </div>
            </header>

            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-32">
                <div className="text-center py-6 px-4 mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-sm border border-slate-200">
                        <span className="text-3xl">☕</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">Welcome to your digital lobby</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Messages disappear after 48 hours. Keep it respectful, safe, and friendly.</p>
                </div>

                {posts.map((post, idx) => {
                    const isMe = post.author.id === currentUser.id;
                    const showHeader = idx === 0 || posts[idx - 1].author.id !== post.author.id;

                    return (
                        <div key={post.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
                            {showHeader && !isMe && (
                                <span className="text-[11px] font-semibold text-slate-500 ml-12 mb-1">
                                    {post.author.first_name} {post.author.last_name}
                                    {post.author.role === 'manager' && <span className="ml-1 text-green-700 font-bold bg-green-50 px-1.5 rounded-md">Manager</span>}
                                </span>
                            )}
                            <div className="flex items-end gap-2 group">
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-200 shadow-sm border border-slate-100">
                                        {post.author.profile_photo ? (
                                            <img src={post.author.profile_photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                        )}
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm text-[15px] leading-relaxed relative ${isMe
                                        ? 'bg-green-700 text-white rounded-br-sm'
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                    }`}>
                                    {post.content}
                                    <span className={`text-[10px] mt-1 block opacity-60 text-right ${isMe ? 'text-green-100' : 'text-slate-400'}`}>
                                        {format(new Date(post.created_at), 'h:mm a')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Form fixed at bottom (above mobile nav logic handled via pb-safe class) */}
            <div className="fixed lg:absolute bottom-16 lg:bottom-0 left-0 lg:left-0 right-0 p-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent z-20">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2 relative shadow-lg shadow-slate-200/50 rounded-full bg-white border border-slate-200 p-1.5 items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Say something friendly..."
                        className="flex-1 bg-transparent border-none px-4 py-2 focus:outline-none text-[#2D3748] placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors disabled:opacity-50 disabled:bg-slate-300 shrink-0"
                    >
                        <span className="text-sm">➤</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
