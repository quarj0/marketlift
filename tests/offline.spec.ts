import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("offline HTML is used only for document navigation",async()=>{
  const listeners:Record<string,(event:unknown)=>void>={};
  const offline=new Response("offline page",{headers:{"Content-Type":"text/html"}});
  vm.runInNewContext(readFileSync("public/sw.js","utf8"),{
    self:{addEventListener:(name:string,callback:(event:unknown)=>void)=>{listeners[name]=callback;}},
    fetch:()=>Promise.reject(new Error("offline")),
    caches:{match:async()=>offline,open:async()=>({match:async()=>offline})}, Response,
  });
  let handled:Promise<Response>|undefined;
  for(const mode of ["cors","same-origin"]) {
    listeners.fetch({request:{method:"GET",mode,url:"https://api.example.invalid/graphql/"},respondWith:(value:Promise<Response>)=>{handled=value;}});
    expect(handled).toBeUndefined();
  }
  listeners.fetch({request:{method:"GET",mode:"navigate",url:"https://example.invalid/search"},respondWith:(value:Promise<Response>)=>{handled=value;}});
  expect(await (await handled)?.text()).toBe("offline page");
});
