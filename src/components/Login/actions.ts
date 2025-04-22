'use server'

import { z } from "zod";
import { loginSchema } from "./schema";
import { redirect, RedirectType } from "next/navigation";
import { cookies } from 'next/headers';
import { ERROR_CODES, getErrorMessage } from '@/lib/constants/errorCodes';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function loginAction(data: z.infer<typeof loginSchema>) {
  const validateFields = loginSchema.safeParse(data);
  if (validateFields.success) {
    try {
      const res = await fetch("http://localhost:3006/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validateFields.data),
      });

      if (!res?.ok) {
        const errorData = await res.json();
        let errorCode = ERROR_CODES.SERVER.INTERNAL_ERROR;

        // Map HTTP status codes to error codes
        if (res.status === 401) {
          errorCode = ERROR_CODES.AUTH.INVALID_CREDENTIALS;
        } else if (res.status === 403) {
          errorCode = ERROR_CODES.AUTH.UNAUTHORIZED;
        } else if (res.status === 422) {
          errorCode = ERROR_CODES.VALIDATION.INVALID_INPUT;
        }

        // Use error code from response if available
        if (errorData.code) {
          errorCode = errorData.code;
        }

        return {
          error: getErrorMessage(errorCode, errorData.message || 'Login failed. Please try again.'),
          code: errorCode
        };
      }

      // Parse the response
      const responseData: LoginResponse = await res.json();

      // Set cookies for authentication
      const cookieStore = await cookies();

      // Set access token cookie
      cookieStore.set({
        name: 'access_token',
        value: responseData.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: responseData.expires_in,
        path: '/'
      });

      // Set refresh token cookie
      cookieStore.set({
        name: 'refresh_token',
        value: responseData.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

    } catch (error) {
      console.dir(error);
      return {
        error: getErrorMessage(ERROR_CODES.SERVER.INTERNAL_ERROR),
        code: ERROR_CODES.SERVER.INTERNAL_ERROR
      };
    }

    redirect("/", RedirectType.push)

  } else {
    console.log(2, validateFields.error);
    return {
      error: getErrorMessage(ERROR_CODES.VALIDATION.INVALID_INPUT, 'Invalid input. Please check your credentials.'),
      code: ERROR_CODES.VALIDATION.INVALID_INPUT,
      validationErrors: validateFields.error.format()
    };
  }
}