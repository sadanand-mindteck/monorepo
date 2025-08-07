import { AccessTokenPayload, loginResponse,  } from "@/types"
import axiosInstance from ".."
import { RegisterFormValues } from "@/app/page"

async function login(payload:RegisterFormValues){
    return  await axiosInstance.post<loginResponse>("/auth/login",payload)

}

export {login}