import test from "node:test";
import assert from "node:assert/strict";

function entitlementFor(subscription,date=new Date()){
 const trialValid=subscription.status==="trialing"&&new Date(subscription.trialEndsAt)>date;
 const paid=subscription.status==="active";
 const exception=subscription.status==="exceptional_access"&&subscription.accessUntil&&new Date(subscription.accessUntil)>date;
 return {allowed:Boolean(trialValid||paid||exception)};
}
function canReadProgress(actor,record){return actor.role==="admin"||actor.id===record.userId}
function canManageTerms(actor){return actor.role==="admin"}

test("students cannot read another student's progress",()=>{
 const actor={id:"student-a",role:"student"};const record={userId:"student-b",termId:"consideration"};
 assert.equal(canReadProgress(actor,record),false);
});
test("students can read their own progress",()=>assert.equal(canReadProgress({id:"a",role:"student"},{userId:"a"}),true));
test("administrators may review progress for support",()=>assert.equal(canReadProgress({id:"admin",role:"admin"},{userId:"student"}),true));
test("students cannot manage terms",()=>assert.equal(canManageTerms({role:"student"}),false));
test("administrators can manage terms",()=>assert.equal(canManageTerms({role:"admin"}),true));
test("seven-day trial expires automatically",()=>{
 const subscription={status:"trialing",trialEndsAt:"2026-08-29T00:00:00Z",accessUntil:null};
 assert.equal(entitlementFor(subscription,new Date("2026-08-28T23:59:00Z")).allowed,true);
 assert.equal(entitlementFor(subscription,new Date("2026-08-29T00:00:00Z")).allowed,false);
});
test("active subscription grants access",()=>assert.equal(entitlementFor({status:"active",trialEndsAt:"2020-01-01",accessUntil:null}).allowed,true));
test("failed and cancelled subscriptions block access",()=>{
 assert.equal(entitlementFor({status:"payment_failed",trialEndsAt:"2020-01-01",accessUntil:null}).allowed,false);
 assert.equal(entitlementFor({status:"cancelled",trialEndsAt:"2020-01-01",accessUntil:null}).allowed,false);
});
