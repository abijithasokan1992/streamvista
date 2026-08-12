import { DatabaseService } from "./database.types";
import { Title,TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
async function request(path:string,init?:RequestInit){const response=await fetch(path,{credentials:"include",...init,headers:{"content-type":"application/json",...init?.headers}});if(!response.ok)throw new Error(`API request failed (${response.status})`);return response.json();}
class ApiDatabaseService implements DatabaseService{
 async getTitles():Promise<Title[]>{return(await request("/api/titles")).titles}
 async getTitleById(id:string):Promise<Title|null>{return(await this.getTitles()).find(t=>t.id===id)||null}
 async getTitlesByCreator():Promise<Title[]>{return this.getTitles()}
 async getTitlesByBuyer():Promise<Title[]>{return this.getTitles()}
 async getDraftsByCreator(creatorId:string):Promise<TitleDraft[]>{return(await request(`/api/drafts?creatorId=${encodeURIComponent(creatorId)}`)).drafts}
 async saveDraft(draft:TitleDraft):Promise<TitleDraft>{return(await request("/api/drafts",{method:"POST",body:JSON.stringify(draft)})).draft}
 async getUsers():Promise<UserProfile[]>{return(await request("/api/users")).users}
}
export const apiDatabaseService=new ApiDatabaseService();
