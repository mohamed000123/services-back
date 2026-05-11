import prisma from "@/database/client";
import { Client } from "@/database/generated/client";
import { GenerateOtpResult } from "@/types/utils/otp.types";

export type { GenerateOtpResult };

/**
 * Generate OTP for signup or login
 * @param phone - client phone number
 * @param isSignupOtp - true for signup, false for login
 */
export async function generateOtpHandler(
  phone: string,
  isSignupOtp: boolean,
): Promise<GenerateOtpResult> {
  const existingAccount: Client | null = await prisma.client.findUnique({
    where: { phone: phone },
  });
  // -------- Signup OTP --------
  if (isSignupOtp) {
    // TODO: Here can use && instead of if and else if to check if the account already exists
    if (existingAccount) {
      return { success: false, message: "Number already used" };
    }
  }

  // -------- Login OTP --------
  if (!isSignupOtp && !existingAccount) {
    return {
      success: false,
      message: "Incorrect number, account not found",
    };
  }

  // Generate OTP (testing mode: fixed OTP)
  // const otp: string = Math.floor(1000 + Math.random() * 9000).toString();
  const otp: string = "0000";

  // Expiry after 5 minutes
  const expiresAt: Date = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP in DB
  await prisma.otp.create({
    data: {
      phone,
      otp,
      expiresAt,
    },
  });

  return {
    success: true,
    message: "OTP generated",
    otp, // todo: adding sms provider
  };
}
