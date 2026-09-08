"use client";
import { useReportWebVitals } from "next/web-vitals";
import { resolveApiUrl } from "@/lib/api-client";
let sampled: boolean | undefined;
function report(metric: { name: string; value: number }) {
  if (process.env.NODE_ENV !== "production" || !["CLS","LCP","INP","TTFB","FCP"].includes(metric.name)) return;
  sampled ??= Math.random() < 0.1;
  if (!sampled) return;
  const path = window.location.pathname;
  const publicRoutes = ["/", "/search", "/register", "/login", "/help", "/help/report"];
  const route = publicRoutes.includes(path) ? path : path.startsWith("/listing/") ? "/listing/:slug" : path.startsWith("/category/") ? "/category/:slug" : path.startsWith("/seller/") ? "/seller/:id" : "/other";
  void fetch(resolveApiUrl("/api/v1/telemetry/web-vitals/"), { method:"POST",credentials:"omit",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({name:metric.name,value:metric.value,route}) }).catch(()=>{});
}
export function WebVitals() { useReportWebVitals(report); return null; }
