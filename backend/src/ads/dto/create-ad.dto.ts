export class CreateAdDto {
    name: string;
    type: string; // 'banner', 'popup'
    placement_code?: string; // 'home_top'
    image_url?: string;
    target_url?: string;
    is_active?: boolean;
    target_news_id?: number;
}
