export type ApiStatus = "success" | "error";

/** Enforce your preference: only https URLs (compile-time hint). */
export type HttpsUrl = `https://${string}`;

/** ISO string from backend, e.g. "2025-12-17T07:40:55.000000Z" */
export type IsoUtcString = string;

export type BannerItem = {
  id: number;
  title: string;
  /** HTML string (can contain <p>, <a>, <table>, etc.) */
  description: string;
  image_url: HttpsUrl;
  link_url: HttpsUrl | null;
  is_active: boolean;
  expires_at: IsoUtcString | null;
  is_promo: boolean;
};

export type BannerPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BannerListResponseType = {
  status: ApiStatus;
  message: string;
  data: BannerItem[];
  pagination: BannerPagination;
};
