import type { Decimal } from "@prisma/client/runtime/client";

export function formatMoney(value: Decimal | null | undefined): string {
  if (value === null || value === undefined) {
    return "0.00";
  }
  return value.toFixed(2);
}
