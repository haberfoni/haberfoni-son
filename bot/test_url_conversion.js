// Test URL conversion logic
const testUrls = [
    '/uploads/userFiles/a54ea27f-6036-4f79-88c6-6bc9ba19a35d/07%2F09%2F07%2FAA-40478097.jpg',
    'https://www.aa.com.tr/uploads/test.jpg',
    'data:image/png;base64,abc123'
];

testUrls.forEach(src => {
    console.log(`\nOriginal: ${src}`);
    console.log(`  startsWith('/'): ${src.startsWith('/')}`);
    console.log(`  startsWith('http://'): ${src.startsWith('http://')}`);
    console.log(`  startsWith('https://'): ${src.startsWith('https://')}`);

    const shouldConvert = src && (src.startsWith('/') || (!src.startsWith('http://') && !src.startsWith('https://')));
    console.log(`  Should convert: ${shouldConvert}`);

    if (shouldConvert) {
        try {
            const decoded = decodeURIComponent(src);
            console.log(`  Decoded: ${decoded}`);

            if (decoded.startsWith('/')) {
                const result = `https://www.aa.com.tr${decoded}`;
                console.log(`  ✅ Result: ${result}`);
            }
        } catch (e) {
            console.log(`  ❌ Decode error: ${e.message}`);
        }
    }
});
