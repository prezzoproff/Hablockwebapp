import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("Seeding initial data...");

    // Example Admin or Root user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hablock.app' },
        update: {},
        create: {
            email: 'admin@hablock.app',
            password_hash: 'REPLACE_ME_IN_PROD', // Dummy hash
            role: 'admin',
            first_name: 'Hablock',
            last_name: 'Admin',
            verified: true,
        },
    });

    console.log(`Created admin user with id: ${admin.id}`);
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
