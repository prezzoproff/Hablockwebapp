import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;

        // Target where the /api/upload endpoint saves files natively.
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', filename);

        const data = await readFile(filePath);

        // Derive explicit mime-type from extensions dynamically.
        const ext = filename.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === 'png') mimeType = 'image/png';
        if (ext === 'webp') mimeType = 'image/webp';
        if (ext === 'gif') mimeType = 'image/gif';

        return new NextResponse(data, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=86400, immutable',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
}
