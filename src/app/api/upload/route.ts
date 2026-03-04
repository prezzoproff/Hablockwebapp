import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MAGIC_BYTES: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const uploadTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    const timestamps = uploadTimestamps.get(ip) || [];
    const recent = timestamps.filter(t => now - t < windowMs);
    uploadTimestamps.set(ip, recent);

    if (recent.length >= maxRequests) {
        return true;
    }
    recent.push(now);
    return false;
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Too many uploads. Please wait a moment.' }, { status: 429 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const expectedMagic = MAGIC_BYTES[file.type];
        if (expectedMagic) {
            const fileMagic = Array.from(buffer.subarray(0, expectedMagic.length));
            const isValid = expectedMagic.every((byte, i) => fileMagic[i] === byte);
            if (!isValid) {
                return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 });
            }
        }

        const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
        const filename = `${crypto.randomUUID()}-${Date.now()}.${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Pointing to the new explicit dynamic router instead of static 'public' bypasses PaaS caching limits.
        const publicUrl = `/api/avatar/${filename}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
