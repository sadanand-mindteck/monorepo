import { AccessTokenPayload, LoginInput,LoginResponse,RegisterInput  } from "@jims/shared/schema/auth"
import axiosInstance from ".."

async function login(payload:RegisterInput){
    const {data} =  await axiosInstance.post<LoginResponse>("/auth/login",payload)
    return data;
}

export {login}