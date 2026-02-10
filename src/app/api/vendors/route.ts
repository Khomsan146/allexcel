import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const contracts = await prisma.vendorContract.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(contracts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const contract = await prisma.vendorContract.create({
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
        return NextResponse.json(contract);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }
}
