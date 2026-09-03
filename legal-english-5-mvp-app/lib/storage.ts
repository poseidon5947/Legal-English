import { Progress, Term, User, seedTerms, seedUsers } from "./domain";

const KEYS={users:"le5.users.v1",terms:"le5.terms.v1",progress:"le5.progress.v1",session:"le5.session.v1"};
function read<T>(key:string,fallback:T):T{if(typeof window==="undefined")return fallback;try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
function write<T>(key:string,value:T){if(typeof window!=="undefined")localStorage.setItem(key,JSON.stringify(value))}
export const demoStore={
 users:()=>read<User[]>(KEYS.users,seedUsers), saveUsers:(v:User[])=>write(KEYS.users,v),
 terms:()=>read<Term[]>(KEYS.terms,seedTerms), saveTerms:(v:Term[])=>write(KEYS.terms,v),
 progress:()=>read<Progress[]>(KEYS.progress,[]), saveProgress:(v:Progress[])=>write(KEYS.progress,v),
 sessionId:()=>read<string|null>(KEYS.session,null), saveSessionId:(v:string|null)=>v?write(KEYS.session,v):localStorage.removeItem(KEYS.session),
 reset:()=>Object.values(KEYS).forEach(k=>localStorage.removeItem(k))
};
