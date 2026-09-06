import type { Page, Route } from "@playwright/test";
export const market = { code:"BR",countryCode:"BR",countryName:"Brasil",locale:"pt-BR",currency:"BRL",currencySymbol:"R$",dialCode:"+55",locationMode:"catalog",paymentMethods:[],paymentsEnabled:false,identityVerificationEnabled:false,identityLabel:"CPF",identityKey:"cpf" };
export const user = { id:"11111111-1111-1111-1111-111111111111",name:"Test Seller",email:"seller@example.invalid",isStaff:false,sellerProfile:{sellerId:"seller",activatedAt:"2026-09-01T00:00:00Z",verified:false,suspended:false} };
export const categories = [{id:"phones",name:"Celulares",active:true,subcategories:[],fields:[],pricing:{mode:"required",label:"Preço"},condition:{enabled:true,options:["Used"]}}];
export const listing = (id: string, city: string) => ({ id, slug:`samsung-${id}`,title:`Samsung ${id}`,price:100,category:"phones",createdAt:"2026-09-01T00:00:00Z",location:{countryCode:"BR",stateCode:"SP",state:"São Paulo",city},images:[],attributes:{},seller:{id:"seller",name:"Seller"} });
export async function respond(route: Route, body: unknown, status=200) {
  await route.fulfill({ status, contentType:"application/json", headers:{"Access-Control-Allow-Origin":route.request().headers().origin || "http://127.0.0.1:3101","Access-Control-Allow-Credentials":"true","Access-Control-Allow-Headers":"content-type,x-csrftoken","Access-Control-Allow-Methods":"GET,POST,OPTIONS"},body:JSON.stringify(body) });
}
export async function mockApi(page: Page, signedIn=false) {
  await page.route("http://127.0.0.1:8123/**", async (route) => {
    const path=new URL(route.request().url()).pathname;
    if(route.request().method()==="OPTIONS") return respond(route,{});
    if(path.includes("/session/")) return respond(route,{authenticated:signedIn,user:signedIn?user:null});
    if(path.includes("/csrf/")) return respond(route,{csrfToken:"test"});
    if(path.includes("/market/")) return respond(route,{active:market,enabledMarkets:[market],payments:{enabled:false},identityVerification:{enabled:false}});
    if(path.includes("/search/")) return respond(route,{results:[],totalCount:0,nextCursor:null});
    if(path.includes("/locations/")) return respond(route,[]);
    if(path.includes("/graphql/")) return respond(route,{data:{categories,category:categories[0],featuredListings:[],recentListings:[],verifiedSellers:[],mySavedListingIds:[],unreadMessageCount:0,unreadNotificationCount:0}});
    return respond(route,{});
  });
}
