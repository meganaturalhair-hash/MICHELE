export interface PlaceReviewLinks {
  placeId: string;
  directReviewUrl: string;
  mapsPlaceUrl: string;
  reviewRedirectUrl: string;
  whatsappMessage: string;
  smsMessage: string;
  emailTemplate: {
    subject: string;
    body: string;
  };
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  rating?: number | null;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  phone?: string;
  types?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  openNow?: boolean | null;
  links: PlaceReviewLinks;
  qrCodeDataUrl?: string;
  summary?: string;
}

export interface BatchItemResult {
  success: boolean;
  input: string | { name?: string; placeId?: string };
  placeId?: string;
  businessName?: string;
  directReviewUrl?: string;
  mapsPlaceUrl?: string;
  reviewRedirectUrl?: string;
  whatsappMessage?: string;
  smsMessage?: string;
  error?: string;
}
