import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';

const prisma = new PrismaClient();

// Next.js 14 requires `params` and `searchParams` to be treated as Promises in Server Components when generating dynamic metadata or rendering
type Props = {
    params: Promise<{ country: string; area: string; building: string; listingId: string }>;
};

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;

    const listing = await prisma.listing.findUnique({
        where: { id: resolvedParams.listingId },
        include: {
            building: true,
            images: { where: { is_cover: true } },
        }
    });

    if (!listing) return { title: 'Listing Not Found' };

    const title = `${listing.bedrooms} Bed, ${listing.bathrooms} Bath in ${listing.building.name} - ${resolvedParams.area}`;
    const coverImage = listing.images[0]?.image_url || '/placeholder.webp';

    return {
        title,
        description: listing.description.substring(0, 160),
        openGraph: {
            title,
            description: listing.description.substring(0, 160),
            images: [coverImage],
            type: 'website',
        }
    };
}

export default async function ListingPage({ params }: Props) {
    const resolvedParams = await params;

    const listing = await prisma.listing.findUnique({
        where: { id: resolvedParams.listingId },
        include: {
            building: true,
            images: { orderBy: { order_index: 'asc' } },
        }
    });

    if (!listing) notFound();

    // JSON-LD Structured Data Schema for Real Estate properties
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: `${listing.bedrooms} Bed in ${listing.building.name}`,
        description: listing.description,
        image: listing.images.map(img => img.image_url),
        offers: {
            '@type': 'Offer',
            price: listing.price,
            priceCurrency: 'USD', // Assumed standard or derived dynamically
            availability: listing.status === 'vacant' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: resolvedParams.area,
            addressCountry: resolvedParams.country
        }
    };

    const coverImage = listing.images.find(img => img.is_cover)?.image_url || listing.images[0]?.image_url;

    return (
        <main className="min-h-screen bg-[#FAF9F6] text-[#2D3748]">
            {/* Inject Structured Data into the Head payload */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Edge-to-Edge Listing Photography requested by Design Guidelines */}
            <div className="relative w-full h-[50vh] bg-slate-200">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={`Cover image for ${listing.building.name}`}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">No Image Available</div>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-semibold mb-2">{listing.building.name}</h1>
                        <p className="text-lg text-[#718096]">
                            {listing.unit_number && `Unit ${listing.unit_number} • `}
                            {resolvedParams.area}, {resolvedParams.country.toUpperCase()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-[#2F5233]">
                            ${listing.price.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium mt-1 uppercase tracking-wide">
                            {listing.status === 'vacant' ? (
                                <span className="text-green-600 font-semibold">Available</span>
                            ) : (
                                <span className="text-red-500">Occupied</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Metadata Bar */}
                <div className="flex gap-8 py-6 border-y border-slate-200 mb-8">
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide">Bedrooms</p>
                        <p className="text-xl font-medium">{listing.bedrooms}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide">Bathrooms</p>
                        <p className="text-xl font-medium">{listing.bathrooms}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide">Square Feet</p>
                        <p className="text-xl font-medium">{listing.sqft.toLocaleString()}</p>
                    </div>
                    {listing.building.managed && (
                        <div className="ml-auto flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                            <span className="text-sm font-medium">✓ Professionally Managed</span>
                        </div>
                    )}
                </div>

                {/* Description Section */}
                <div className="prose max-w-none text-[#2D3748]">
                    <h2 className="text-xl font-semibold mb-4">About this home</h2>
                    <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>
                </div>
            </div>
        </main>
    );
}
