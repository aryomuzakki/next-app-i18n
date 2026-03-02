export type VerifiedUserType = {
  id: number; // 1
  name: string; // ""
  email: string; // "81234567890@62.temp.user"
  country_code: string; // "+62"
  phone_number: string; // "81234567890"
  phone_verified_at: string; // "2025-11-03T12:00:00.000000Z"
};

export type VerifyOtpDataType = {
  user_exists: boolean; // false
  user: VerifiedUserType;
  token: string; // "1|abcdef123456789..."
  token_expires_at: string; // "2025-12-03T12:00:00.000000Z"
};

export type VerifyOtpResponseType = {
  success: boolean; // true
  message: string; // "OTP verified successfully"
  data: VerifyOtpDataType;
};
