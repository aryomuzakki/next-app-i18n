export type SendOtpDataType = {
  user_exists: boolean; // false
  country_code: string; // "+62"
  phone_number: string; // "81234567890"
  otp_expires_at: string; // "2025-11-03T12:05:00.000000Z"
  otp_code: string; // "123456"
};

export type SendOtpResponseType = {
  success: boolean; // true
  message: string; // "OTP sent successfully"
  data: SendOtpDataType;
};