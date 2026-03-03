import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ country: string; area: string }>;
};

export default async function AreaListingsPage({ params }: Props) {
    const resolvedParams = await params;
    const countryQuery = resolvedParams.country.toLowerCase();
    const areaQuery = resolvedParams.area.toLowerCase();

    const listings = await prisma.listing.findMany({
        // Only map active vacant listings filtered to the explicit area block
        where: {
            status: 'vacant',
            building: {
                country: { equals: countryQuery },
                area: { equals: areaQuery }
            }
        },
        include: {
            building: true,
            images: {
                where: { is_cover: true },
                take: 1,
            },
        },
        orderBy: { created_at: 'desc' },
    });

    return (
        <main className="min-h-screen bg-[#FAF9F6] px-6 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href={`/listings/${countryQuery}`} className="text-sm text-[#718096] hover:text-[#2F5233] transition-colors mb-4 inline-block">
                        ← Back to {countryQuery}
                    </Link>
                    <h1 className="text-4xl font-semibold text-[#2D3748] capitalize">
                        Homes in {areaQuery}, {countryQuery}
                    </h1>
                </div>

                {/* Reusable Grid matching listing map layout strictly */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map((listing: any) => (
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

                                <div className="flex gap-4 text-sm text-[#718096] border-t border-slate-100 pt-3 mt-4">
                                    <span className="flex items-center gap-1">
                                        <strong className="text-[#2D3748]">{listing.bedrooms}</strong> Beds
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <strong className="text-[#2D3748]">{listing.bathrooms}</strong> Baths
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {listings.length === 0 && (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-medium text-[#2D3748] mb-2">No listings available</h2>
                        <p className="text-[#718096]">We couldn&apos;t find any vacant properties in {areaQuery}.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
