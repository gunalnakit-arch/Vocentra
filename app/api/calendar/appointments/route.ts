import { NextResponse } from 'next/server';
import { calendarDb } from '@/lib/calendar-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (!from || !to) {
            return NextResponse.json({ error: 'Missing from or to parameters' }, { status: 400 });
        }

        const appointments = await calendarDb.getAppointments(from, to);

        return NextResponse.json({
            appointments
        });
    } catch (error: any) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { customer_name, phone, start_time, duration_min, notes } = body;

        if (!customer_name || !start_time || !duration_min) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const appointment = await calendarDb.createAppointment({
            customerName: customer_name,
            phone: phone || '',
            startTime: new Date(start_time),
            durationMin: duration_min,
            notes: notes
        });

        return NextResponse.json({
            status: "confirmed",
            appointment_id: appointment.id,
            appointment
        });
    } catch (error: any) {
        console.error('Error creating appointment:', error);
        if (error.status === 409) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
