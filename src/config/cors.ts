import env from "@/config/env";
import cors from "cors";

// For admin
const adminAllowedOrigins: (string | undefined)[] = [env("ADMIN_URL")];

/**
 * CORS options for the admin frontend.
 *
 * This configuration restricts cross-origin requests to only the origins specified
 * in the `adminAllowedOrigins` array, which is typically set via the `ADMIN_URL` environment variable.
 * If the request's origin matches the allowed origin, or if the request has no origin
 * (such as with same-origin or server-to-server requests), the request is permitted.
 * Otherwise, the request is rejected with a CORS error.
 *
 * Credentials (such as cookies and authorization headers) are allowed to be sent in cross-origin requests.
 *
 * Usage:
 *   app.use(cors(adminCorsOptions));
 */
export const adminCorsOptions: cors.CorsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin: (origin: any, callback: any) => {
    if (!origin || adminAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
