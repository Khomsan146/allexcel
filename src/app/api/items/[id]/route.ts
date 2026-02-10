import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, url, note, category, status, color } = body;

        const updatedItem = await prisma.checklistItem.update({
            where: { id },
            data: {
                title,
                url,
                note,
                category,
                status,
                color,
                lastChecked: status ? new Date() : undefined,
            },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.checklistItem.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
