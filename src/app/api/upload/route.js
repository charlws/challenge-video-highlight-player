// src/app/api/upload/route.js

import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({ error: 'Invalid content type' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const fileSize = file.size;
        const fileType = file.type;

        if (!fileType.startsWith('video/')) {
            return new Response(JSON.stringify({ error: 'File is not a video' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        if (fileSize > 50 * 1024 * 1024) { // 50MB limit
            return new Response(JSON.stringify({ error: 'File size exceeds 50MB' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const videosDir = path.join(process.cwd(), 'videos');
        await fs.mkdir(videosDir, { recursive: true });

        const fileExtension = path.extname(file.name);
        const filePath = path.join(videosDir, `video${fileExtension}`);
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(filePath, fileBuffer);

        return new Response(JSON.stringify({ message: 'File uploaded successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}