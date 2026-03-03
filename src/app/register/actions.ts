'use server';

import { PrismaClient } from '@prisma/client';
import { setCookieSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generateUploadUrl, getPublicUrl } from '@/lib/storage';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Step 1: Location Fetching
export async function getCountries() {
    const countries = await prisma.locationCountry.findMany({
        orderBy: { name: 'asc' }
    });
    return countries;
}

export async function requestAvatarUploadUrl() {
    const fileKey = `avatars/${crypto.randomUUID()}-${Date.now()}.jpg`;
    const url = await generateUploadUrl(fileKey, 'image/jpeg');
    return { uploadUrl: url, publicUrl: getPublicUrl(fileKey) };
}

export async function createCountry(name: string) {
    const normalized = name.trim();
    if (!normalized) throw new Error("Country name cannot be empty");

    return await prisma.locationCountry.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized }
    });
}

export async function getAreas(countryName: string) {
    if (!countryName) return [];
    const areas = await prisma.locationArea.findMany({
        where: { country_name: countryName },
        orderBy: { name: 'asc' }
    });
    return areas;
}

export async function createArea(countryName: string, areaName: string) {
    const normalizedArea = areaName.trim();
    if (!normalizedArea || !countryName) throw new Error("Invalid Input");

    // Ensure country exists first
    await prisma.locationCountry.upsert({
        where: { name: countryName },
        update: {},
        create: { name: countryName }
    });

    return await prisma.locationArea.upsert({
        where: {
            country_name_name: {
                country_name: countryName,
                name: normalizedArea
            }
        },
        update: {},
        create: {
            country_name: countryName,
            name: normalizedArea
        }
    });
}

// Step 2: Building Search & Generation
export async function searchBuildings(country: string, area: string, query: string) {
    if (!country || !area) return [];

    const buildings = await prisma.building.findMany({
        where: {
            country,
            area,
            name: { contains: query } // Implicit SQLite LIKE constraint
        },
        take: 10,
        orderBy: { name: 'asc' }
    });

    return buildings;
}

function generateBuildingCode(): string {
    // Generate a random 6 character alphanumeric code
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars hex
}

export async function createOrGetBuilding(name: string, country: string, area: string) {
    const normalizedName = name.trim();
    if (!normalizedName || !country || !area) throw new Error("Missing parameters for building");

    // Transaction to generate code and create or verify building uniqueness flawlessly
    return await prisma.$transaction(async (tx) => {
        let building = await tx.building.findUnique({
            where: {
                name_country_area: {
                    name: normalizedName,
                    country,
                    area
                }
            }
        });

        if (building) return building;

        let code = generateBuildingCode();
        // Safety check sequence
        let exists = await tx.building.findUnique({ where: { building_code: code } });
        while (exists) {
            code = generateBuildingCode();
            exists = await tx.building.findUnique({ where: { building_code: code } });
        }

        building = await tx.building.create({
            data: {
                name: normalizedName,
                country,
                area,
                building_code: code,
            }
        });

        // AUTO-SEED INITIATOR POST
        // Locate admin system user or create one lazily to own the persistent post
        let admin = await tx.user.findFirst({ where: { role: 'admin' } });
        if (!admin) {
            // Fallback admin logic if none exists structurally
            admin = await tx.user.create({
                data: {
                    email: 'system@infiniteworkflow.system',
                    password_hash: 'system',
                    first_name: 'Hablock',
                    last_name: 'System',
                    role: 'admin'
                }
            });
        }

        await tx.post.create({
            data: {
                building_id: building.id,
                author_id: admin.id,
                content: "👋 Say hi to your neighbours! Introduce yourself and tell everyone a little about you.",
                persistent: true,
            }
        });

        return building;
    });
}

// Step 3: Resolving Units
export async function createOrGetUnit(buildingId: string, unitLabel: string) {
    // Format string natively ignoring unapproved specials
    const normalized = unitLabel.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!normalized) throw new Error("Invalid unit specificator");

    const unit = await prisma.unit.upsert({
        where: {
            building_id_unit_label: {
                building_id: buildingId,
                unit_label: normalized
            }
        },
        update: {},
        create: {
            building_id: buildingId,
            unit_label: normalized
        }
    });

    return unit;
}

// Registration Finalization
export async function finalizeRegistration(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const phone = formData.get('phone_number') as string;
    const photo = formData.get('profile_photo') as string | null;

    // From dynamic contexts
    const role = formData.get('role') as string || 'resident';
    const buildingId = formData.get('building_id') as string;
    const unitId = formData.get('unit_id') as string | null;

    if (!email || !password || !firstName || !lastName || !buildingId) {
        return { error: "Missing highly critical parameters" };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "Email already in use" };
    }

    const user = await prisma.user.create({
        data: {
            email,
            password_hash: password,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            profile_photo: photo,
            role: role,
            building_id: buildingId,
            unit_id: unitId,
            verified: false,
        }
    });

    await setCookieSession({
        id: user.id,
        role: user.role,
        building_id: user.building_id,
        unit_id: user.unit_id,
        first_name: user.first_name,
        last_name: user.last_name || undefined
    });

    if (user.role === 'manager' || user.role === 'admin') {
        redirect('/manager/dashboard');
    } else {
        redirect('/app/feed');
    }
}
