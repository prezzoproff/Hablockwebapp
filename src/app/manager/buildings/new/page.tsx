import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Internal function triggering random short code generator
function generateBuildingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default async function NewBuildingPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('hablock_access')?.value;
    const user = verifyAccessToken(token!);

    async function registerBuilding(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const country = formData.get('country') as string;
        const area = formData.get('area') as string;

        if (!name || !country || !area) {
            // Basic server-side validation stub
            return;
        }

        try {
            // Execute a Prisma Transaction locking down the creation payload strictly
            await prisma.$transaction(async (tx) => {
                // Find existing to prevent duplicates based on Schema composite unique constraint
                const existing = await tx.building.findUnique({
                    where: {
                        name_country_area: { name, country, area }
                    }
                });

                if (existing) {
                    throw new Error('Building already exists');
                }

                const newBuilding = await tx.building.create({
                    data: {
                        name,
                        country: country.toLowerCase(),
                        area: area.toLowerCase(),
                        building_code: generateBuildingCode(),
                        managed: true, // Registered directly by Manager
                        manager_id: user!.id,
                    }
                });

                // Scaffold initial Welcome Community Posts directly into the Transaction Block
                await tx.post.createMany({
                    data: [
                        {
                            building_id: newBuilding.id,
                            author_id: user!.id,
                            content: "👋 Say hi to your neighbours! Introduce yourself.",
                            persistent: true
                        },
                        {
                            building_id: newBuilding.id,
                            author_id: user!.id,
                            content: "🏡 Welcome to your Hablock community.",
                            persistent: true
                        }
                    ]
                });
            });
        } catch (e) {
            console.error("Building Registration failed.", e);
            // Re-rendering with error states is more complex in Server Actions without useFormState hook
            // Bypassing UX error rendering stub locally for architecture rewrite scopes.
            return;
        }

        // Success logic routes back
        redirect('/manager/buildings');
    }

    return (
        <div className="max-w-2xl animate-in fade-in duration-300">
            <Link href="/manager/buildings" className="text-sm rounded-lg text-green-700 font-medium hover:underline inline-flex items-center gap-1 mb-6">
                <span>←</span> Back
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register Building</h1>
                    <p className="text-slate-500 mt-2">
                        Establish a new property on Hablock. We will automatically generate a unique 6-character building code for your residents to join.
                    </p>
                </div>

                <form action={registerBuilding} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Building Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                            placeholder="e.g. The Metropolitan"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="country" className="block text-sm font-semibold text-slate-700 mb-2">Country <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                                placeholder="e.g. US"
                            />
                        </div>

                        <div>
                            <label htmlFor="area" className="block text-sm font-semibold text-slate-700 mb-2">Area / City <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="area"
                                name="area"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                                placeholder="e.g. Manhattan"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100 flex gap-3 mt-6">
                        <span className="text-lg">ℹ️</span>
                        <p>Upon registration, two persistent welcome posts will be automatically generated in the community feed to encourage resident engagement.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-green-900 transition-all hover:-translate-y-0.5"
                        >
                            Create Building Directory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
