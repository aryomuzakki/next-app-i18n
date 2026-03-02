export const SESSION_COOKIE_NAME = "khourts_session";

export const BOOKING_ALLOWED_KEY = "khourts_booking_allowed";

// if (!process.env.API_URL) {
//   throw new Error("❌ Missing API_URL in .env");
// }

export const API_URL = process.env.API_URL;

export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thekhourt.com";

export const IS_DEV = process.env.NODE_ENV === "development";

export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "production";

export const NORMAL_HOURLY_RATE = process.env.NEXT_PUBLIC_NORMAL_HOURLY_RATE;
