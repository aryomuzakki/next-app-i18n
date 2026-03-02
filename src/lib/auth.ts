import { API_URL, SESSION_COOKIE_NAME } from "@/lib/constant";
import logger from "@/lib/logger";
import type { GetProfileDataType, GetProfileResponseType } from "@/types/auth/user";
import { cookies } from "next/headers";

export const dummyUser = {
  id: 0,
  country_code: "+62",
  phone_number: "81234567890",
  name: "Hanifah Atiyah Kusnadi",
  email: "hanifah@example.com"
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Replace this with your real session lookup (DB / JWT / etc.)
export async function getUserData(token?: string): Promise<GetProfileDataType | null> {
  const sesToken = token || await getSessionToken();
  if (!sesToken) return null;
  return (await getUserResponse(sesToken))?.data || null;
}

export function getMaxAge(token_expires_at: string, fallback?: number): number {
  if (!token_expires_at) return fallback || 60 * 60 * 24; // 1 day
  const expire = new Date(token_expires_at).getTime(); // expiration timestamp (ms)
  const now = Date.now(); // current timestamp (ms)
  const diffMs = expire - now; // difference in ms

  // convert ms → seconds for cookie maxAge
  return Math.max(0, Math.floor(diffMs / 1000));
}

export async function getUserResponse(token: string) {

  if (!API_URL) {
    return {
      success: true,
      data: dummyUser,
    };
  }

  try {
    const result = await fetch(`${API_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!result.ok) {
      logger.debug({ url: result.url, status: result.status, json: await result.clone().json() });
      throw new Error("Error on get user profile");
    }

    const getProfile: GetProfileResponseType = await result.json();

    logger.debug(getProfile);

    return getProfile;
  } catch (error) {
    logger.debug(error);
    return null;
  }
}