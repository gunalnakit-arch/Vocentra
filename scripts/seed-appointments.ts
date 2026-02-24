import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
    const client = new Client({
        connectionString: process.env.SUPABASE_DATABASE_URL,
    });

    await client.connect();

    console.log("Creating appointments table if not exists...");
    await client.query(`
        CREATE TABLE IF NOT EXISTS appointments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            customer_name TEXT NOT NULL,
            phone TEXT,
            start_time TIMESTAMPTZ NOT NULL,
            end_time TIMESTAMPTZ NOT NULL,
            duration_min INT NOT NULL,
            status TEXT DEFAULT 'confirmed',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    console.log("Clearing existing appointments...");
    await client.query('DELETE FROM appointments;');

    console.log("Seeding appointments for the next 3 months (50% full)...");

    const today = new Date();

    const insertQuery = `
        INSERT INTO appointments (customer_name, phone, start_time, end_time, duration_min, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    let totalSlots = 0;
    let filledSlots = 0;

    for (let dayOffset = 0; dayOffset <= 90; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);

        // 09:00 to 18:00 (Local Time) -> let's just use local numbers and convert to ISO string.
        // Note: Because we deal with timezones, let's keep it simple.
        for (let hour = 9; hour < 18; hour++) {
            for (let min of [0, 30]) {
                // Ignore dates in the past
                const slotTime = new Date(currentDate);
                slotTime.setHours(hour, min, 0, 0);
                if (slotTime.getTime() < Date.now()) {
                    continue;
                }

                totalSlots++;

                // 50% chance to book
                if (Math.random() < 0.5) {
                    const end_time = new Date(slotTime.getTime() + 30 * 60000);

                    await client.query(insertQuery, [
                        `Kullanıcı ${filledSlots + 1}`,
                        `+90 555 123 45 ${Math.floor(Math.random() * 99)}`,
                        slotTime.toISOString(),
                        end_time.toISOString(),
                        30,
                        'confirmed',
                        'Otomatik oluşturulmuş randevu.'
                    ]);

                    filledSlots++;
                }
            }
        }
    }

    console.log(`Seeding complete. Created ${filledSlots} appointments out of ${totalSlots} possible available future slots.`);

    // Notify postgrest to reload the schema cache so Supabase API notices the new table
    try {
        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log("Reloaded PostgREST schema cache.");
    } catch (e) { }

    await client.end();
}

seed().catch(err => {
    console.error("Error seeding:", err);
    process.exit(1);
});
