export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2F5233] rounded-full animate-spin mb-4"></div>
                <p className="text-[#718096] font-medium animate-pulse">Loading Hablock...</p>
            </div>
        </div>
    );
}
