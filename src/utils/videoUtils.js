export const getYouTubeId = (url) => {
    if (!url) return null;

    // RegEx to handle various YouTube URL formats
     
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[7].length === 11) ? match[7] : null;
};

export const getEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = getYouTubeId(url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
};

export const isDirectVideo = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.mp4') ||
        lowerUrl.endsWith('.webm') ||
        lowerUrl.endsWith('.ogg') ||
        lowerUrl.endsWith('.m3u8') ||
        lowerUrl.includes('/uploads/videos/');
};
