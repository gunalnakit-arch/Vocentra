import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'db.json');
        if (!fs.existsSync(dbPath)) {
            console.error('db.json not found');
            return;
        }

        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        console.log(`Starting migration: ${dbData.assistants.length} assistants, ${dbData.calls.length} calls`);

        // 1. Migrate Assistants
        for (const assistant of dbData.assistants) {
            console.log(`Migrating assistant: ${assistant.name} (${assistant.id})`);
            const { error } = await supabase
                .from('assistants')
                .upsert({
                    id: assistant.id,
                    tenant_id: assistant.tenantId || 'default-tenant',
                    name: assistant.name,
                    description: assistant.description,
                    system_instruction: assistant.systemInstruction,
                    voice: assistant.voice,
                    language: assistant.language,
                    provider: assistant.provider,
                    provider_assistant_id: assistant.providerAssistantId,
                    files: assistant.files || [],
                    voice_config: assistant.voiceConfig || {},
                    avatar_config: assistant.avatarConfig || {},
                    created_at: assistant.createdAt,
                    updated_at: assistant.updatedAt
                });

            if (error) {
                console.error(`Error migrating assistant ${assistant.id}:`, error.message);
            }
        }

        // 2. Migrate Calls
        for (const call of dbData.calls) {
            console.log(`Migrating call: ${call.id}`);
            const { error } = await supabase
                .from('calls')
                .upsert({
                    id: call.id,
                    assistant_id: call.assistantId,
                    provider: call.provider,
                    created_at: call.createdAt,
                    duration: call.duration,
                    cost: call.cost,
                    summary: call.summary,
                    short_summary: call.shortSummary,
                    transcript: call.transcript || [],
                    analytics: call.analytics || {},
                    metadata: call.metadata || {}
                });

            if (call.analytics) {
                console.log(`> Call ${call.id} has analytics with ${Object.keys(call.analytics).length} keys. Upserting...`);
            }

            if (error) {
                console.error(`Error migrating call ${call.id}:`, error.message);
            }
        }

        console.log('Migration completed successfully!');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    }
}

migrate();
