import request from "@/lib/request";
import {User} from "@/utils/user/userType"


export const userLogin =(data:User) =>{
 
 return request.post("/user/login",data)
}