import {  LoginInput,LoginResponse  } from "@jims/shared/schema/auth"
import axiosInstance from ".."

async function login(payload:LoginInput){
    const {data} =  await axiosInstance.post<LoginResponse>("/auth/login",payload)
    return data;
}

export {login}