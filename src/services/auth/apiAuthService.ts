import { AuthService } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { supabase } from "../supabase";

type ProfileRow={id:string;email:string;display_name:string;app_role:UserRole;created_at:string;updated_at:string};
const mapProfile=(p:ProfileRow):UserProfile=>({uid:p.id,email:p.email,displayName:p.display_name,role:p.app_role,createdAt:p.created_at,updatedAt:p.updated_at});
async function profile(id:string){const{data,error}=await supabase.from("sv_app_profiles").select("id,email,display_name,app_role,created_at,updated_at").eq("id",id).single();if(error)throw new Error(error.message);return mapProfile(data as ProfileRow);}
class ApiAuthService implements AuthService{
 async getCurrentUser():Promise<UserProfile|null>{const{data:{user}}=await supabase.auth.getUser();return user?profile(user.id):null}
 async login(email:string,password?:string):Promise<UserProfile>{if(!password)throw new Error("Password is required");const{data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error||!data.user)throw new Error(error?.message||"Invalid email or password");return profile(data.user.id)}
 async signup(email:string,password:string,displayName:string){const{data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{display_name:displayName.trim()}}});if(error)throw new Error(error.message);const confirmed=Boolean(data.session&&data.user);return{user:confirmed&&data.user?await profile(data.user.id):null,confirmationRequired:!confirmed};}
 async logout():Promise<void>{const{error}=await supabase.auth.signOut();if(error)throw new Error(error.message)}
}
export const apiAuthService=new ApiAuthService();
