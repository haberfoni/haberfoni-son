export const getYouTubeId = (url) => {
    if (!url) return null;

    // RegEx to handle various YouTube URL formats
    // eslint-disable-next-line no-useless-escape
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[7].length === 11) ? match[7] : null;
};

export const getEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};
