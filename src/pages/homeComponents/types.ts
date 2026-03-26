export interface AboutSliderData {
  about_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
}

export interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
}

export interface AboutCardData {
  id: number;
  type: "Brand" | "News" | "Events";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
}

export interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: number;
  logo_img_file: string;
}

export interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
}