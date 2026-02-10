import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as xlsx from 'xlsx';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet) as any[];

        const createdItems = [];

        for (const row of data) {
            // Mapping common column names
            const title = row['Title'] || row['Name'] || row['title'] || row['name'];
            const url = row['URL'] || row['Link'] || row['url'] || row['link'];
            const note = row['Note'] || row['note'] || row['Description'] || row['description'];
            const category = row['Category'] || row['category'] || row['Group'] || row['group'];

            if (title && url) {
                const item = await prisma.checklistItem.create({
                    data: {
                        title: title.toString(),
                        url: url.toString(),
                        note: note ? note.toString() : null,
                        category: category ? category.toString() : 'General',
                        status: 'Unknown',
                    },
                });
                createdItems.push(item);
            }
        }

        return NextResponse.json({
            message: `Successfully imported ${createdItems.length} items`,
            count: createdItems.length
        });
    } catch (error) {
        console.error('Error uploading excel:', error);
        return NextResponse.json({ error: 'Failed to process Excel file' }, { status: 500 });
    }
}
