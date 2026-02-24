import { NextResponse } from 'next/server';
import { calendarDb } from '@/lib/calendar-db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { appointment_id } = body;

        if (!appointment_id) {
            return NextResponse.json({ error: 'Missing appointment_id' }, { status: 400 });
        }

        const appointment = await calendarDb.cancelAppointment(appointment_id);

        return NextResponse.json({
            status: "cancelled",
            appointment_id: appointment.id
        });
    } catch (error: any) {
        console.error('Error cancelling appointment:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
