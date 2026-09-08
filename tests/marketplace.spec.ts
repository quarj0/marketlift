import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { mockApi, respond, listing } from "./fixtures";
const require = createRequire(`${process.cwd()}/package.json`);

for (const path of ["/", "/search", "/register"]) {
  test(`320px reflow and accessibility: ${path}`, async ({ page }) => {
    await page.setViewportSize({width:320,height:720});
    await mockApi(page);
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
    const failures = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (context: Document, options: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe;
      return (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations;
    });
    expect(failures).toEqual([]);
  });
}

test("guest mobile menu opens as a compact right-side drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  await page.goto("/about");
  await page.getByRole("button", { name: /Abrir menu|Open menu/ }).click();

  const dialog = page.getByRole("dialog");
  const browse = dialog.getByRole("link", {
    name: /Explorar o marketplace|Browse marketplace/,
  });
  await expect(dialog).toBeVisible();
  await expect(browse).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          height: rect.height,
          right: window.innerWidth - rect.right,
          top: rect.top,
        };
      }),
    )
    .toEqual({ height: 844, right: 0, top: 0 });
  await expect
    .poll(() => browse.evaluate((element) => element.getBoundingClientRect().height))
    .toBeLessThanOrEqual(56);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("category navigation does not require a server metadata API request", async ({ page }) => {
  await mockApi(page);
  await page.goto("/search");
  await page.getByRole("contentinfo").getByRole("link", { name: "Celulares" }).click();

  await expect(page).toHaveURL(/\/category\/phones$/);
  await expect(page.getByRole("heading", { name: /Celulares|Phones/ }).first()).toBeVisible({ timeout: 20_000 });
});

test("search exhausts local pages before announcing another area", async ({ page }) => {
  await mockApi(page);
  const requests: URL[]=[];
  await page.route("**/api/v1/search/listings/**",async route => {
    const url=new URL(route.request().url());requests.push(url);
    const next=url.searchParams.get("cursor");
    await respond(route,{results:[listing(next?"Campinas":"Centro",next?"Campinas":"São Paulo")],totalCount:1,nextCursor:next?null:"next-area",geography:{key:next?"1":"0",level:next?"state":"city",label:next?"SP":"São Paulo",origin:"São Paulo",expanded:Boolean(next),areaExhausted:true,windowLimited:false}});
  });
  await page.goto("/search?q=samsung&state=SP&city=S%C3%A3o+Paulo&minPrice=50");
  await expect(page.getByText("Samsung Centro",{exact:true})).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByText("Samsung Campinas",{exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:/Você viu todos os anúncios em São Paulo/})).toBeVisible();
  expect(requests.every(url=>url.searchParams.get("q")==="samsung" && url.searchParams.get("minPrice")==="50" && url.searchParams.get("expandRegions")==="true")).toBe(true);
});

test("search keeps category filters compact and clears dependent values immediately", async ({ page }) => {
  await mockApi(page);
  const audioCategory = {
    id: "audio",
    name: "Áudio",
    active: true,
    subcategories: [],
    schemaVersion: 2,
    description: "",
    pricing: { mode: "required", label: "Preço" },
    condition: { enabled: true, required: false, options: ["Used"] },
    fields: [
      { id: "product_type", label: "Product type", type: "select", filterable: true, options: [{ value: "speaker", label: "Speaker" }] },
      { id: "brand", label: "Brand", type: "select", filterable: true, options: [{ value: "jbl", label: "JBL" }] },
      { id: "model", label: "Model", type: "select", filterable: true, lazyOptions: true, dependsOn: "brand", options: [] },
      ...["speaker_distortion", "battery_issue", "connectivity_issue", "feature_bluetooth", "feature_wifi"].map((id) => ({ id, label: id.replaceAll("_", " "), type: "boolean", filterable: true, options: [] })),
    ],
  };
  await page.route("**/graphql/", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    const { query } = route.request().postDataJSON();
    if (query.includes("CategoryFieldOptions")) {
      return respond(route, { data: { categoryFieldOptions: [{ value: "flip", label: "Flip 7" }] } });
    }
    if (query.includes("query Categories")) {
      return respond(route, { data: { categories: [audioCategory] } });
    }
    if (query.includes("query Category")) {
      return respond(route, { data: { category: audioCategory } });
    }
    return route.fallback();
  });

  await page.goto("/search?category=audio&attr.brand=jbl&attr.model=flip&state=SP&city=S%C3%A3o+Paulo");
  await expect(page.locator("#attr-model")).toBeVisible();
  await expect(page.getByRole("button", { name: /Mostrar mais 5 filtros|Show 5 more filters/ })).toBeVisible();
  await expect(page.locator("#attr-speaker_distortion")).toHaveCount(0);

  await page.locator("#attr-brand").selectOption("");
  await expect(page.locator("#attr-model")).toHaveCount(0);
  await expect(page).not.toHaveURL(/attr\.brand|attr\.model/);

  await page.getByRole("button", { name: /Redefinir filtros|Reset filters/ }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3101/search");
  await expect(page.locator("#search-filter-state")).toHaveValue("");
  await expect(page.locator("#search-filter-city")).toHaveValue("");
});

test("search moves more than five secondary category filters into a modal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  const audioCategory = {
    id: "audio",
    name: "Áudio",
    active: true,
    subcategories: [],
    schemaVersion: 2,
    description: "",
    pricing: { mode: "required", label: "Preço" },
    condition: { enabled: true, required: false, options: ["Used"] },
    fields: [
      { id: "product_type", label: "Product type", type: "select", filterable: true, options: [] },
      { id: "brand", label: "Brand", type: "select", filterable: true, options: [] },
      ...["battery_issue", "body_damage", "connectivity_issue", "feature_bluetooth", "feature_wifi", "needs_repair"].map((id) => ({ id, label: id.replaceAll("_", " "), type: "boolean", filterable: true, options: [] })),
    ],
  };
  await page.route("**/graphql/", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    const { query } = route.request().postDataJSON();
    if (query.includes("query Categories")) return respond(route, { data: { categories: [audioCategory] } });
    if (query.includes("query Category")) return respond(route, { data: { category: audioCategory } });
    return route.fallback();
  });

  await page.goto("/search?category=audio");
  await page.getByRole("button", { name: /^Filtros$|^Filters$/ }).click();
  const mobileFilters = page.getByRole("dialog", { name: /^Filtros$|^Filters$/ });
  await expect(mobileFilters).toBeVisible();
  await mobileFilters.getByRole("button", { name: /Mostrar mais 6 filtros|Show 6 more filters/ }).click();
  const dialog = page.getByRole("dialog", { name: /Mais filtros da categoria|More category filters/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#attr-feature_wifi")).toBeVisible();
  await dialog.getByRole("button", { name: /Concluído|Done/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect(mobileFilters).toBeVisible();
});

test("signed-in footer omits guest account actions", async ({ page }) => {
  await mockApi(page, true);
  await page.goto("/about");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: /Entrar|Log in/, exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: /Criar conta|Create account/, exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: /Anúncios salvos|Saved listings/, exact: true })).toBeVisible();
});

test("support preserves input on failure and displays a real ticket reference", async ({ page }) => {
  await mockApi(page,true);
  let attempts=0;
  await page.route("**/graphql/",async route=>{
    if (route.request().method() !== "POST") return route.fallback();
    const body=route.request().postDataJSON();
    if(!body.query.includes("createSupportTicket")) return route.fallback();
    attempts++;
    if(attempts===1) return respond(route,{errors:[{message:"Try again",extensions:{status:503}}]});
    return respond(route,{data:{createSupportTicket:{id:"ticket-one",reference:"SUP-REAL123",...body.variables.input,messages:[],status:"open"}}});
  });
  await page.goto("/help/report");
  await page.getByLabel("Assunto",{exact:true}).fill("Problema com meu anúncio");
  await page.locator("textarea").fill("Meu anúncio não aparece na busca.");
  await page.getByRole("button",{name:/Enviar/}).click();
  await expect(page.getByRole("alert").filter({hasText:"Try again"})).toBeVisible();
  await expect(page.locator("textarea")).toHaveValue("Meu anúncio não aparece na busca.");
  await page.getByRole("button",{name:/Enviar/}).click();
  await expect(page.getByText("SUP-REAL123")).toBeVisible();
});

test("seller draft survives reload without publishing",async({page})=>{
  await mockApi(page,true);
  await page.goto("/selling/listings/new");
  await page.getByRole("button",{name:/Celulares/}).click();
  await page.getByRole("button",{name:/Próximo|Continuar/}).click();
  const title=page.locator('input[name="title"]');
  await title.fill("Samsung draft phone");
  await expect.poll(()=>page.evaluate(()=>Object.keys(sessionStorage).some(key=>key.includes("listing-draft") && sessionStorage.getItem(key)?.includes("Samsung draft phone")))).toBe(true);
  await page.reload();
  await expect(page.getByRole("status")).toContainText("Rascunho restaurado");
});

test("logout removes account A data before account B signs in", async ({ page }) => {
  await mockApi(page,true);
  let signedIn = true;
  let account = "A";
  await page.route("**/api/v1/auth/session/",route=>respond(route,{authenticated:signedIn,user:signedIn?{id:account,name:`Account ${account}`,email:`${account}@example.invalid`}:null}));
  await page.route("**/api/v1/auth/logout/",route=>{signedIn=false;return respond(route,{success:true});});
  await page.route("**/api/v1/auth/login/",route=>{signedIn=true;account="B";return respond(route,{authenticated:true,user:{id:account,name:"Account B",email:"B@example.invalid"}});});
  await page.route("**/graphql/",async route=>{
    if(route.request().method()!=="POST") return route.fallback();
    const {query}=route.request().postDataJSON();
    if(!query.includes("myReviews")) return route.fallback();
    if(!signedIn) return respond(route,{errors:[{message:"Sign in required",extensions:{status:401}}]});
    if(account==="B") await new Promise(resolve=>setTimeout(resolve,1500));
    return respond(route,{data:{myReviews:[{id:`review-${account}`,sellerId:"seller",sellerName:"Seller",rating:4,comment:`Private review ${account}`,date:"2026-09-01T00:00:00Z"}]}});
  });
  await page.goto("/account/reviews");
  await expect(page.getByText("Private review A",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:/Minha conta: Account A/i}).click();
  await page.getByRole("menuitem",{name:/Sair/}).click();
  await expect(page.getByText("Private review A",{exact:true})).toHaveCount(0);
  await expect(page).toHaveURL(/\/login/);
  await page.locator('input[name="emailOrPhone"]').fill("B@example.invalid");
  await page.locator('input[name="password"]').fill("example-password");
  await page.getByRole("button",{name:/Entrar/}).click();
  // The returnTo redirect uses client navigation and the same in-memory cache.
  await expect(page.getByText("Private review A",{exact:true})).toHaveCount(0);
  await expect(page.getByText("Private review B",{exact:true})).toBeVisible();
});
