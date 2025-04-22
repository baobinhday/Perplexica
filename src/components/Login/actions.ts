'use server'

import { z } from "zod";
import { loginSchema } from "./schema";
import { redirect } from "next/navigation";

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
  
      const data = await res.json();
      if (res?.ok) {
        console.log(data);
        redirect("/")
      }

    } catch (error) {
      console.dir(error);
      return error;
    }
  } else {
    console.log(2, validateFields.error);
    return validateFields.error;
  }
}