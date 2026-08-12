import { DatabaseService } from "./database.types";
import { Title,TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
import { supabase } from "../supabase";
type TitleRow={id:string;creator_owner_id:string;payload:Record<string,unknown>;status:string;created_at:string;updated_at:string};
const mapTitle=(r:TitleRow)=>({...r.payload,id:r.id,creatorOwnerId:r.creator_owner_id,status:r.status,createdAt:r.created_at,updatedAt:r.updated_at}) as Title;
class ApiDatabaseService implements DatabaseService{
 async getTitles():Promise<Title[]>{const{data,error}=await supabase.from("sv_app_titles").select("id,creator_owner_id,payload,status,created_at,updated_at");if(error)throw new Error(error.message);return(data as TitleRow[]).map(mapTitle)}
 async getTitleById(id:string):Promise<Title|null>{return(await this.getTitles()).find(t=>t.id===id)||null}
 async getTitlesByCreator():Promise<Title[]>{return this.getTitles()}
 async getTitlesByBuyer():Promise<Title[]>{return this.getTitles()}
 async getDraftsByCreator(creatorId:string):Promise<TitleDraft[]>{const{data,error}=await supabase.from("sv_app_titles").select("id,creator_owner_id,payload,status,created_at,updated_at").eq("creator_owner_id",creatorId).eq("status","draft");if(error)throw new Error(error.message);return(data as TitleRow[]).map(mapTitle) as TitleDraft[]}
 async saveDraft(draft:TitleDraft):Promise<TitleDraft>{const row={id:draft.id,creator_owner_id:draft.creatorOwnerId,payload:draft,status:"draft",updated_at:new Date().toISOString()};const{data,error}=await supabase.from("sv_app_titles").upsert(row).select("id,creator_owner_id,payload,status,created_at,updated_at").single();if(error)throw new Error(error.message);return mapTitle(data as TitleRow) as TitleDraft}
 async getUsers():Promise<UserProfile[]>{const{data,error}=await supabase.from("sv_app_profiles").select("id,email,display_name,app_role,created_at,updated_at");if(error)throw new Error(error.message);return data.map(p=>({uid:p.id,email:p.email,displayName:p.display_name,role:p.app_role,createdAt:p.created_at,updatedAt:p.updated_at})) as UserProfile[]}
}
export const apiDatabaseService=new ApiDatabaseService();
