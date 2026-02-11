function verifyTimezone() {
    console.log('--- Verifying Timezone Logic ---');

    const now = new Date();
    // Simulate Ad Start Date (UTC 12:46)
    const adStartDateStr = "2026-02-10T12:46:00+00:00";

    console.log(`Current Client Time: ${now.toISOString()}`); // e.g. 2026-02-10T12:50:00.000Z
    console.log(`Ad Start Date Str: ${adStartDateStr}`);

    const startDate = new Date(adStartDateStr);
    console.log(`Parsed Start Date: ${startDate.toISOString()}`);

    if (now < startDate) {
        console.log('FAIL: Ad is considered FUTURE (Hidden)');
    } else {
        console.log('SUCCESS: Ad is considered ACTIVE (Visible)');
    }

    // Difference check
    const diff = now - startDate;
    console.log(`Difference (ms): ${diff}`);
    if (diff > 0) {
        console.log('Logic confirms positive difference (Visible).');
    }
}

verifyTimezone();
