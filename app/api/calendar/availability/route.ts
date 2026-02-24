import { NextResponse } from 'next/server';
import { calendarDb } from '@/lib/calendar-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const durationMin = parseInt(searchParams.get('durationMin') || '30', 10);

        if (!date) {
            return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
        }

        const freeSlots = await calendarDb.getAvailability(date, durationMin);

        return NextResponse.json({
            date,
            duration_min: durationMin,
            free_slots: freeSlots
        });
    } catch (error: any) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
