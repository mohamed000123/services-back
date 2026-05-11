export interface GenerateOtpResult {
  success: boolean;
  message?:
    | "Number already used"
    | "Incorrect number, account not found"
    | "OTP generated";
  otp?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message?: "Invalid OTP" | "OTP expired" | "Number already used" | "account not found";
  actionType?: "signup" | "login";
  phone?: string;
}
