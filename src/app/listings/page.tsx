import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ListingsIndexPage() {
    // Pull all actively vacant listings bounded for the global marketplace feed
    const listings = await prisma.listing.findMany({
        where: { status: 'vacant' },
        include: {
            building: true,
            images: {
                where: { is_cover: true },
                take: 1,
            },
        },
        orderBy: { created_at: 'desc' },
        take: 50, // Initial pagination limit
    });

    return (
        <main className="min-h-screen bg-[#FAF9F6] px-6 py-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-semibold text-[#2D3748] mb-8">
                    Discover properties across the Hablock Network.
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing) => (
                        <Link
                            key={listing.id}
                            href={`/listings/${listing.building.country}/${listing.building.area}/${listing.building.name.replace(/\s+/g, '-').toLowerCase()}/${listing.id}`}
                            className="group block bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-250"
                        >
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                {listing.images[0] ? (
                                    <img
                                        src={listing.images[0].image_url}
                                        alt={`${listing.building.name} cover`}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <span className="text-sm">No Photo</span>
                                    </div>
                                )}

                                {/* Subtle gradient overlay at bottom for absolute text readability if desired later */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-[#2D3748] truncate pr-4">
                                        {listing.building.name}
                                    </h3>
                                    <span className="font-bold text-[#2F5233]">
                                        ${listing.price.toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-[#718096] text-sm mb-4">
                                    {listing.building.area}, {listing.building.country.toUpperCase()}
                                </p>

                                <div className="flex gap-4 text-sm text-[#718096] border-t border-slate-100 pt-3">
                                    <span className="flex items-center gap-1">
                                        <strong className="text-[#2D3748]">{listing.bedrooms}</strong> Beds
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <strong className="text-[#2D3748]">{listing.bathrooms}</strong> Baths
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <strong className="text-[#2D3748]">{listing.sqft}</strong> sqft
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">🏠</span>
                        </div>
                        <h2 className="text-xl font-medium text-[#2D3748] mb-2">No listings found</h2>
                        <p className="text-[#718096]">Check back later for new properties added to the network.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
