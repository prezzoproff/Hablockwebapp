import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("Seeding initial data...");

    const admin = await prisma.user.upsert({
        where: { email: 'admin@hablock.app' },
        update: {},
        create: {
            email: 'admin@hablock.app',
            password_hash: 'REPLACE_ME_IN_PROD',
            role: 'admin',
            first_name: 'Hablock',
            last_name: 'Admin',
            verified: true,
        },
    });

    console.log(`Created admin user with id: ${admin.id}`);

    const countries = [
        { name: 'Kenya', areas: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Nyeri'] },
        { name: 'Nigeria', areas: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'] },
        { name: 'South Africa', areas: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
        { name: 'Tanzania', areas: ['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Zanzibar'] },
        { name: 'Uganda', areas: ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara'] },
        { name: 'Ghana', areas: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'] },
        { name: 'Rwanda', areas: ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri'] },
        { name: 'Ethiopia', areas: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar'] },
        { name: 'United Arab Emirates', areas: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'] },
        { name: 'United Kingdom', areas: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Edinburgh'] },
        { name: 'United States', areas: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'] },
    ];

    for (const country of countries) {
        await prisma.locationCountry.upsert({
            where: { name: country.name },
            update: {},
            create: { name: country.name },
        });

        for (const area of country.areas) {
            await prisma.locationArea.upsert({
                where: {
                    country_name_name: {
                        country_name: country.name,
                        name: area,
                    },
                },
                update: {},
                create: {
                    country_name: country.name,
                    name: area,
                },
            });
        }
    }

    console.log(`Seeded ${countries.length} countries with areas`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
