"use client";

import type { ComponentType } from "react";
import {
  Baby, BedDouble, Bike, BriefcaseBusiness, Building2, BusFront, Camera, Car,
  Cpu, Dumbbell, Factory, Gamepad2, Hammer, HardHat, Headphones, HeartPulse,
  House, Laptop, MapPinned, Monitor, Music, PackageSearch, PawPrint, Plane,
  Printer, Router, Shirt, ShoppingBag, Smartphone, Sofa, Sparkles, Store,
  Tablet, Tractor, Truck, Tv, Utensils, Watch, Wheat, Wrench,
} from "lucide-react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
type CategoryLike = { id?: string | null; name?: string | null; icon?: string | null };

const explicitIcons: Record<string, IconType> = {
  Baby, Bike, BriefcaseBusiness, Building2, Camera, Car, Cpu, Dumbbell, Factory,
  Gamepad2, Hammer, HardHat, Headphones, House, Laptop, Monitor, Music, PawPrint,
  Printer, Router, Shirt, ShoppingBag, Smartphone, Sofa, Sparkles, Store, Tablet,
  Tractor, Truck, Tv, Watch, Wheat, Wrench,
};

type SemanticRule = { terms: string[]; icon: IconType; tone: string };

const rules: SemanticRule[] = [
  { terms: ["video game", "gaming", "console", "playstation", "xbox", "nintendo"], icon: Gamepad2, tone: "bg-violet-50 text-violet-700" },
  { terms: ["camera", "photo", "photography"], icon: Camera, tone: "bg-fuchsia-50 text-fuchsia-700" },
  { terms: ["headphone", "audio", "speaker", "sound"], icon: Headphones, tone: "bg-purple-50 text-purple-700" },
  { terms: ["music", "instrument"], icon: Music, tone: "bg-purple-50 text-purple-700" },
  { terms: ["network", "router", "wifi", "modem"], icon: Router, tone: "bg-sky-50 text-sky-700" },
  { terms: ["printer", "scanner"], icon: Printer, tone: "bg-slate-100 text-slate-700" },
  { terms: ["monitor", "display"], icon: Monitor, tone: "bg-blue-50 text-blue-700" },
  { terms: ["computer hardware", "component", "processor", "cpu", "gpu", "graphics card"], icon: Cpu, tone: "bg-indigo-50 text-indigo-700" },
  { terms: ["laptop", "computer", "notebook"], icon: Laptop, tone: "bg-blue-50 text-blue-700" },
  { terms: ["smart watch", "smartwatch", "watch"], icon: Watch, tone: "bg-cyan-50 text-cyan-700" },
  { terms: ["tablet", "ipad"], icon: Tablet, tone: "bg-cyan-50 text-cyan-700" },
  { terms: ["mobile phone", "mobile phones", "phone", "phones", "smartphone"], icon: Smartphone, tone: "bg-cyan-50 text-cyan-700" },
  { terms: ["television", "tv", "video equipment"], icon: Tv, tone: "bg-indigo-50 text-indigo-700" },
  { terms: ["electronics", "electronic"], icon: Cpu, tone: "bg-blue-50 text-blue-700" },

  { terms: ["motorcycle", "motorbike", "bike"], icon: Bike, tone: "bg-orange-50 text-orange-700" },
  { terms: ["truck", "lorry"], icon: Truck, tone: "bg-orange-50 text-orange-700" },
  { terms: ["bus", "van", "minibus"], icon: BusFront, tone: "bg-orange-50 text-orange-700" },
  { terms: ["car", "vehicle", "automotive"], icon: Car, tone: "bg-orange-50 text-orange-700" },

  { terms: ["house", "houses", "apartment", "apartments", "home for sale", "home for rent"], icon: House, tone: "bg-emerald-50 text-emerald-700" },
  { terms: ["bedroom", "short let", "short stay"], icon: BedDouble, tone: "bg-emerald-50 text-emerald-700" },
  { terms: ["land", "plot", "plots"], icon: MapPinned, tone: "bg-lime-50 text-lime-700" },
  { terms: ["commercial property", "office", "venue", "workspace"], icon: Building2, tone: "bg-emerald-50 text-emerald-700" },
  { terms: ["property", "real estate", "new builds"], icon: Building2, tone: "bg-emerald-50 text-emerald-700" },

  { terms: ["furniture", "sofa", "home appliance", "appliances"], icon: Sofa, tone: "bg-amber-50 text-amber-700" },
  { terms: ["fashion", "clothes", "clothing", "shoe", "shoes"], icon: Shirt, tone: "bg-pink-50 text-pink-700" },
  { terms: ["beauty", "cosmetic", "skincare", "personal care"], icon: Sparkles, tone: "bg-rose-50 text-rose-700" },
  { terms: ["baby", "babies", "kid", "kids", "children"], icon: Baby, tone: "bg-sky-50 text-sky-700" },
  { terms: ["animal", "animals", "pet", "pets"], icon: PawPrint, tone: "bg-teal-50 text-teal-700" },

  { terms: ["food", "restaurant", "catering"], icon: Utensils, tone: "bg-green-50 text-green-700" },
  { terms: ["farm", "farming", "agriculture", "agricultural"], icon: Tractor, tone: "bg-green-50 text-green-700" },
  { terms: ["grain", "crop", "seed"], icon: Wheat, tone: "bg-green-50 text-green-700" },

  { terms: ["construction", "building service", "builder"], icon: HardHat, tone: "bg-yellow-50 text-yellow-700" },
  { terms: ["repair", "mechanic", "maintenance"], icon: Wrench, tone: "bg-yellow-50 text-yellow-700" },
  { terms: ["tool", "tools", "hardware tool"], icon: Hammer, tone: "bg-yellow-50 text-yellow-700" },
  { terms: ["commercial equipment", "industrial equipment", "industry", "industrial"], icon: Factory, tone: "bg-slate-100 text-slate-700" },
  { terms: ["business"], icon: Store, tone: "bg-slate-100 text-slate-700" },
  { terms: ["job", "jobs", "career", "vacancy"], icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-700" },
  { terms: ["service", "services"], icon: Wrench, tone: "bg-sky-50 text-sky-700" },
  { terms: ["sport", "fitness", "gym", "leisure", "activity", "activities"], icon: Dumbbell, tone: "bg-violet-50 text-violet-700" },
  { terms: ["travel", "flight", "aviation"], icon: Plane, tone: "bg-sky-50 text-sky-700" },
  { terms: ["health", "medical"], icon: HeartPulse, tone: "bg-red-50 text-red-700" },
];

function searchable(category: CategoryLike) {
  return `${category.id || ""} ${category.name || ""}`.replace(/[-_]+/g, " ").toLocaleLowerCase("en");
}

export function resolveCategoryVisual(category: CategoryLike) {
  const text = searchable(category);

  for (const rule of rules) {
    if (rule.terms.some((term) => text.includes(term))) {
      return { Icon: rule.icon, tone: rule.tone };
    }
  }

  const explicit = String(category.icon || "").trim();
  if (explicit && explicit !== "Grid3X3" && explicit !== "Grid") {
    const Icon = explicitIcons[explicit];
    if (Icon) return { Icon, tone: "bg-brand-50 text-brand-700" };
  }

  return { Icon: PackageSearch, tone: "bg-slate-100 text-slate-700" };
}

export function CategoryIcon({
  category,
  className = "size-5",
}: {
  category: CategoryLike;
  className?: string;
}) {
  const { Icon } = resolveCategoryVisual(category);
  return <Icon className={className} aria-hidden={true} />;
}
