-- 1. Create the appointments table if it does not exist
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

-- Note: RLS disabled for testing. To enable, define your security policies.

-- 2. Clear existing old appointments if any (optional, uncomment to clear all)
-- DELETE FROM appointments;

-- 3. Seed appointments for the next 90 days (~3 months), filling slots with a 50% probability
DO $$
DECLARE
    cur_date DATE := CURRENT_DATE;
    hr INT;
    mn INT;
    rand_val REAL;
    start_ts TIMESTAMPTZ;
    end_ts TIMESTAMPTZ;
    i INT;
BEGIN
    FOR d IN 0..90 LOOP
        FOR hr IN 9..17 LOOP
            -- Iterate through 10:00, 10:30, etc. (0 and 30 minutes)
            FOREACH mn IN ARRAY ARRAY[0, 30] LOOP
                rand_val := random();
                
                -- Construct the start_time properly
                start_ts := timezone('Europe/Istanbul', (cur_date + d) + make_interval(hours := hr, mins := mn));
                
                -- Only insert if time is in the future AND random condition meets 50%
                IF start_ts > NOW() AND rand_val > 0.5 THEN
                    INSERT INTO appointments (customer_name, phone, start_time, end_time, duration_min, notes)
                    VALUES (
                        'Test Müşteri ' || floor(random() * 1000)::text, 
                        '+90555' || lpad(floor(random() * 10000000)::text, 7, '0'), 
                        start_ts, 
                        start_ts + interval '30 minutes', 
                        30, 
                        'Sistem tarafından otomatik oluşturuldu.'
                    );
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
