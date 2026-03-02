export type SessionUserType = {
  id: number; // 1
  name: string; // ""
  email: string; // "81234567890@62.temp.user"
  country_code: string; // "+62"
  phone_number: string; // "81234567890"
  phone_verified_at: string; // "2025-11-03T12:00:00.000000Z"
};

export type GetProfileDataType = {
  id: number; // 4
  country_code: string; // "+62"
  phone_number: string; // "12124"
  name: string; // "Robert"
  email: string;
};

export type GetProfileResponseType = {
  success: boolean; // true
  data: GetProfileDataType;
};

export type UpdatedProfileDataType = {
  id: number; // 4
  country_code: string; // "+62"
  phone_number: string; // "12124"
  name: string; // "Robert"
  email: string; // "12124@62.temp.user"
  email_verified_at: string | null; // null
  phone_verified_at: string; // "2025-11-25 18:10:11+00"
};

export type UpdateProfileResponseType = {
  success: boolean; // true
  data: UpdatedProfileDataType;
};
