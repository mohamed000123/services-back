import prisma from "@/database/client";
import { Client, Otp } from "@/database/generated/client";
import { VerifyOtpResult } from "@/types/utils/otp.types";

export type { VerifyOtpResult };

export async function verifyOtp(
  phone: string,
  otp: string,
  isSignupOtp: boolean,
): Promise<VerifyOtpResult> {
  const otpRecord: Otp | null = await prisma.otp.findFirst({
    where: {
      phone,
      otp,
      isUsed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return { success: false, message: "Invalid OTP" };
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    return { success: false, message: "OTP expired" };
  }

  // Mark OTP as used
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  const existingAccount: Client | null = await prisma.client.findUnique({
    where: { phone: phone },
  });
  // ---------------- Signup Flow ----------------
  if (isSignupOtp) {
    if (existingAccount) {
      return {
        success: false,
        message: "Number already used",
      };
    }

    return {
      success: true,
      actionType: "signup",
      phone,
    };
  }

  // ---------------- Login Flow ----------------
  if (!existingAccount) {
    return {
      success: false,
      message: "account not found",
    };
  }

  return {
    success: true,
    actionType: "login",
    phone,
  };
}
