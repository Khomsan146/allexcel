import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const items = await prisma.checklistItem.findMany();

        const results = await Promise.all(items.map(async (item: { id: string; url: string }) => {
            let status = 'Error';
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const res = await fetch(item.url, {
                    method: 'HEAD',
                    signal: controller.signal,
                    headers: { 'User-Agent': 'ChecklistMonitor/1.0' }
                }).catch(() => fetch(item.url, { method: 'GET', signal: controller.signal }));

                clearTimeout(timeoutId);

                if (res.ok) {
                    status = 'OK';
                }
            } catch (e) {
                status = 'Error';
            }

            return prisma.checklistItem.update({
                where: { id: item.id },
                data: { status, lastChecked: new Date() }
            });
        }));

        return NextResponse.json({ message: 'Health check completed', count: results.length });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
    }
}
