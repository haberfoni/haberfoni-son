import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkHomeLayout() {
    try {
        console.log('🔍 Checking home_layout setting...\n');

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'home_layout')
            .single();

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        if (!data) {
            console.log('⚠️  home_layout setting not found in database');
            return;
        }

        console.log('✅ home_layout setting found:\n');

        const layout = JSON.parse(data.value);

        console.log('Sections:');
        layout.sections.forEach((section, index) => {
            const status = section.enabled ? '✅ ENABLED' : '❌ DISABLED';
            console.log(`  ${index + 1}. ${section.id.padEnd(25)} ${status}`);
        });

        const homeTopSection = layout.sections.find(s => s.id === 'home_top');

        console.log('\n📍 home_top section:');
        if (homeTopSection) {
            console.log(`   Status: ${homeTopSection.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
            console.log(`   Name: ${homeTopSection.name || 'N/A'}`);
            console.log(`   Type: ${homeTopSection.type || 'N/A'}`);
        } else {
            console.log('   ⚠️  NOT FOUND in layout config!');
        }

        // Check show_empty_ads setting
        const { data: emptyAdsData } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'show_empty_ads')
            .single();

        console.log('\n📍 show_empty_ads setting:');
        if (emptyAdsData) {
            console.log(`   Value: ${emptyAdsData.value === 'true' ? '✅ TRUE (show empty ads)' : '❌ FALSE (hide empty ads)'}`);
        } else {
            console.log('   ⚠️  NOT FOUND (defaults to TRUE)');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkHomeLayout();
