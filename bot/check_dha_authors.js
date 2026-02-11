
import { supabase } from './src/db.js';

async function check() {
    const { data, error } = await supabase
        .from('news')
        .select('title, author, content')
        .eq('source', 'DHA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) console.error(error);
    else {
        console.log(JSON.stringify(data.map(n => ({
            title: n.title,
            author: n.author,
            hasImages: n.content && n.content.includes('<img'),
            contentSnippet: n.content ? n.content.substring(0, 500) : ''
        })), null, 2));
    }

    process.exit();
}
check();
