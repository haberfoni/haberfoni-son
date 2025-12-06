import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'd MMMM yyyy HH:mm', { locale: tr });
};

export const mapNewsItem = (item) => {
    return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: item.content,
        image: item.image_url || item.image, // Support both
        category: item.categories ? item.categories.name : (item.category || 'Genel'),
        time: item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale: tr }) : (item.time || ''),
        views: item.views,
        author: item.author,
        isSlider: item.is_slider,
        sliderOrder: item.slider_order,
        video_url: item.video_url,
        media_type: item.media_type,
        slug: item.slug // Custom slug support
    };
};

export const mapVideoItem = (item) => {
    return {
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail_url,
        videoUrl: item.video_url,
        duration: item.duration,
        views: item.views,
        date: item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale: tr }) : ''
    };
};

export const mapPhotoGalleryItem = (item) => {
    return {
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail_url,
        views: item.views,
        date: item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale: tr }) : '',
        count: 0 // We might need to fetch image count separately or add it to the view
    };
};
