import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const date = new Date(Date.now() - 3600000); // 1 hour ago
console.log('Test Date:', date.toISOString());
try {
    const relative = formatDistanceToNow(date, { addSuffix: true, locale: tr });
    console.log('Relative:', relative);
} catch (e) {
    console.error('Error:', e);
}
