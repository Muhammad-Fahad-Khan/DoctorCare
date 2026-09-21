export interface CmsSection<T = unknown> {
  key: string;
  order: number;
  content: T;
}

export interface CmsPageResponse {
  slug: string;
  title: string;
  updatedAt: string;
  sections: CmsSection[];
}

export interface HeroContent {
  heading: string;
  subheading: string;
  ctaLabel: string;
  backgroundImageUrl?: string;
}

export interface ChatbotIntroContent {
  promptText: string;
}

export interface FeatureItem {
  icon: string; // lucide-react icon name
  title: string;
  description: string;
}
export interface FeaturesContent {
  items: FeatureItem[];
}

export interface TestimonialItem {
  name: string;
  quote: string;
  rating: number;
  verified: boolean;
}
export interface TestimonialsContent {
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqContent {
  items: FaqItem[];
}

export interface StoryContent {
  heading: string;
  body: string;
  imageUrl?: string;
}

export interface StatItem {
  label: string;
  value: string;
}
export interface StatsContent {
  items: StatItem[];
}

export interface ContactDetailsContent {
  address: string;
  email: string;
  phone: string;
}

/**
 * Admin-managed background images, one optional "images" section per page.
 * A missing key means "use the built-in default"; an empty string means "the admin removed it".
 */
export interface ImagesContent {
  heroBackground?: string; // home
  ctaBackground?: string; // home, closing banner
  headerBackground?: string; // about + contact page headers
}
