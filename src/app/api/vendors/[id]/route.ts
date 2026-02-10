import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedVendor = await prisma.vendorContract.update({
            where: { id },
            data: {
                vendorName: body.vendorName,
                contactName: body.contactName,
                email: body.email,
                phone: body.phone,
                contractType: body.contractType,
                expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
                note: body.note,
            },
        });

        return NextResponse.json(updatedVendor);
    } catch (error) {
        console.error('Error updating vendor:', error);
        return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.vendorContract.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Vendor deleted' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
    }
}
