import { AuthService } from "./auth.types";
import { UserProfile } from "../../types/auth";
async function request(path:string,init?:RequestInit){const response=await fetch(path,{credentials:"include",...init,headers:{"content-type":"application/json",...init?.headers}});if(!response.ok)throw new Error(response.status===401?"Invalid email or password":"Authentication request failed");return response.status===204?null:response.json();}
class ApiAuthService implements AuthService{
 async getCurrentUser():Promise<UserProfile|null>{try{return(await request("/api/auth/me")).user}catch{return null}}
 async login(email:string,password?:string):Promise<UserProfile>{return(await request("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})})).user}
 async logout():Promise<void>{await request("/api/auth/logout",{method:"POST"})}
}
export const apiAuthService=new ApiAuthService();
