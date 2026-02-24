import { supabase } from './supabase';
import { Appointment } from './types';

// Appointments
export const calendarDb = {
    getAppointments: async (from: string, to: string): Promise<Appointment[]> => {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .gte('start_time', from)
            .lte('start_time', to)
            .order('start_time', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapAppointment);
    },

    getAvailability: async (date: string, durationMin: number = 30): Promise<{ start_time: string, end_time: string }[]> => {
        // Working hours: 09:00 - 18:00 (Local time usually, but keeping it simple for now)
        const workStartHour = 9;
        const workEndHour = 18;

        // Parse date
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) throw new Error("Invalid date formatted");

        // Fetch existing appointments for the day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: existingAppts, error } = await supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('status', 'confirmed')
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());

        if (error) throw error;

        const freeSlots = [];
        let currentSlotStart = new Date(targetDate);
        currentSlotStart.setHours(workStartHour, 0, 0, 0);

        const endOfWorkDay = new Date(targetDate);
        endOfWorkDay.setHours(workEndHour, 0, 0, 0);

        while (currentSlotStart.getTime() + durationMin * 60000 <= endOfWorkDay.getTime()) {
            const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMin * 60000);

            // Check for conflict
            const isConflict = existingAppts?.some(appt => {
                const apptStart = new Date(appt.start_time).getTime();
                const apptEnd = new Date(appt.end_time).getTime();

                // Overlap condition
                return currentSlotStart.getTime() < apptEnd && currentSlotEnd.getTime() > apptStart;
            });

            if (!isConflict && currentSlotStart.getTime() > Date.now()) {
                freeSlots.push({
                    start_time: currentSlotStart.toISOString(),
                    end_time: currentSlotEnd.toISOString()
                });
            }

            // Advance by slot step (e.g., 30 mins)
            currentSlotStart = new Date(currentSlotStart.getTime() + 30 * 60000);
        }

        return freeSlots;
    },

    createAppointment: async (appt: Partial<Appointment>): Promise<Appointment> => {
        // Check availability strictly
        if (!appt.startTime || !appt.durationMin) throw new Error("Missing start time or duration");

        const startTime = new Date(appt.startTime);
        const endTime = new Date(startTime.getTime() + appt.durationMin * 60000);

        const { data: conflicts, error: conflictErr } = await supabase
            .from('appointments')
            .select('id')
            .eq('status', 'confirmed')
            .lt('start_time', endTime.toISOString())
            .gt('end_time', startTime.toISOString());

        if (conflictErr) throw conflictErr;
        if (conflicts && conflicts.length > 0) {
            const err = new Error("Slot is already booked");
            (err as any).status = 409;
            throw err;
        }

        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                customer_name: appt.customerName,
                phone: appt.phone,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration_min: appt.durationMin,
                notes: appt.notes || '',
                status: 'confirmed',
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) throw error;
        return mapAppointment(data);
    },

    cancelAppointment: async (id: string): Promise<Appointment> => {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapAppointment(data);
    }
};

function mapAppointment(data: any): Appointment {
    return {
        id: data.id,
        customerName: data.customer_name,
        phone: data.phone,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        durationMin: data.duration_min,
        status: data.status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
    };
}
