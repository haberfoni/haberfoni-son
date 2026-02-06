import { scrapeIHA } from './src/scrapers/iha.js';
import { scrapeAA } from './src/scrapers/aa.js';
import { scrapeDHA } from './src/scrapers/dha.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log('Bot started. Waiting for schedule or commands...');

// Run immediately on start for testing
runAll();

// Schedule: Every 15 minutes
cron.schedule('*/15 * * * *', () => {
    console.log('Running scheduled scrape...');
    runAll();
});

// Command Polling (Every 10 seconds)
setInterval(async () => {
    await checkCommands();
}, 10000);

async function checkCommands() {
    try {
        const { data: commands } = await supabase
            .from('bot_commands')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .limit(1);

        if (commands && commands.length > 0) {
            const cmd = commands[0];
            console.log(`Received command: ${cmd.command}`);

            // Mark processing
            await supabase.from('bot_commands').update({ status: 'PROCESSING', executed_at: new Date() }).eq('id', cmd.id);

            if (cmd.command === 'FORCE_RUN') {
                console.log('Executing FORCE RUN...');
                await runAll();
            }

            // Mark completed
            await supabase.from('bot_commands').update({ status: 'COMPLETED' }).eq('id', cmd.id);
            console.log('Command completed.');
        }
    } catch (error) {
        console.error('Error checking commands:', error);
    }
}

async function runAll() {
    await scrapeIHA();
    await scrapeAA();
    await scrapeDHA();
}
