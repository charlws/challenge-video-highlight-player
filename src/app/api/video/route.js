// src/app/api/video/route.js

import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const videosDir = path.join(process.cwd(), 'videos');
        const files = await fs.readdir(videosDir);
        const videoFile = files.find(file => file.startsWith('video'));

        if (!videoFile) {
            return new Response(JSON.stringify({ error: 'Video file not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const filePath = path.join(videosDir, videoFile);
        const fileBuffer = await fs.readFile(filePath);
        const fileExtension = path.extname(videoFile).substring(1);

        return new Response(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': `video/${fileExtension}`,
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