import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function mimicAdLogic() {
    console.log('--- Mimicking AdBanner Logic ---');

    console.log('1. Fetching ALL ads (like adminService.getAdPlacements)');
    const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching ads:', error);
        return;
    }

    console.log(`Fetched ${ads.length} ads.`);

    const placementCode = 'home_list_top';
    const isMobile = false; // Testing desktop
    const pageContext = { type: 'home', category: null };
    const newsId = null;

    console.log(`\nTesting filtering for:`);
    console.log(`- placementCode: "${placementCode}"`);
    console.log(`- isMobile: ${isMobile}`);
    console.log(`- pageContext:`, pageContext);

    // 2. Filter Logic (Copied from AdBanner.jsx)
    const placementAds = ads.filter(ad => {
        const isActive = ad.is_active;
        const codeMatch = ad.placement_code === placementCode;
        const deviceMatch = (!ad.device_type || ad.device_type === 'all' || ad.device_type === (isMobile ? 'mobile' : 'desktop'));

        if (ad.placement_code === 'home_list_top') {
            console.log(`\nChecking Ad ID: ${ad.id} (${ad.name})`);
            console.log(`  is_active (${ad.is_active}): ${isActive}`);
            console.log(`  placement_code ("${ad.placement_code}" === "${placementCode}"): ${codeMatch}`);
            console.log(`  device_type (${ad.device_type}): ${deviceMatch}`);
        }

        return isActive && codeMatch && deviceMatch;
    });

    console.log(`\nPlacement Filter Result: ${placementAds.length} ads found.`);

    const targetedAds = placementAds.filter(ad => {
        // News ID Targeting
        if (ad.target_news_id) {
            console.log('  Failed target_news_id check');
            if (pageContext.type === 'detail' && newsId) {
                return String(ad.target_news_id) === String(newsId);
            }
            return false;
        }

        // Date Scheduling
        const now = new Date();
        if (ad.start_date && now < new Date(ad.start_date)) {
            console.log('  Failed start_date check');
            return false;
        }
        if (ad.end_date && now > new Date(ad.end_date)) {
            console.log('  Failed end_date check');
            return false;
        }

        // Target page
        const targetPage = ad.target_page || 'all';
        console.log(`  target_page: ${targetPage}`);
        if (targetPage === 'all') return true;
        if (targetPage === 'home' && pageContext.type === 'home') return true;
        if (targetPage === 'category') {
            return pageContext.type === 'category' || pageContext.type === 'detail';
        }
        if (targetPage === 'detail' && pageContext.type === 'detail') return true;

        console.log('  Failed target_page check');
        return false;
    });

    console.log(`\nFinal Active Ads: ${targetedAds.length}`);
    targetedAds.forEach(ad => console.log(`- FOUND: ${ad.name} (${ad.id})`));
}

mimicAdLogic();
