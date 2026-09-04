"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import {
  Armchair,
  Baby,
  Bath,
  BedDouble,
  Bike,
  Bird,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  BusFront,
  Cable,
  Camera,
  Car,
  Cat,
  ChefHat,
  CircleGauge,
  ClipboardList,
  Construction,
  CookingPot,
  Cpu,
  Dog,
  DoorOpen,
  Drill,
  Dumbbell,
  Factory,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  GraduationCap,
  Hammer,
  HardHat,
  Headphones,
  HeartPulse,
  Hotel,
  House,
  Lamp,
  LandPlot,
  Laptop,
  Leaf,
  MapPinned,
  Megaphone,
  Monitor,
  Music,
  PackageSearch,
  Palette,
  PawPrint,
  Plane,
  Plug,
  Presentation,
  Printer,
  Receipt,
  Refrigerator,
  Router,
  Ruler,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  SprayCan,
  Stethoscope,
  Store,
  Tablet,
  TentTree,
  ToyBrick,
  Tractor,
  Truck,
  Tv,
  Utensils,
  WashingMachine,
  Watch,
  Wheat,
  Wrench,
} from "lucide-react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
type CategoryLike = {
  id?: string | null;
  name?: string | null;
  icon?: string | null;
};

const explicitIcons: Record<string, IconType> = {
  Baby, Bike, BriefcaseBusiness, Building2, Camera, Car, Cpu, Dumbbell, Factory,
  Gamepad2, Hammer, HardHat, Headphones, House, Laptop, Monitor, Music, PawPrint,
  Printer, Router, Shirt, ShoppingBag, Smartphone, Sofa, Sparkles, Store, Tablet,
  Tractor, Truck, Tv, Watch, Wheat, Wrench,
};

type SemanticRule = { terms: string[]; icon: IconType; tone: string };
type CategoryVisual = { Icon: IconType; tone: string };

const visualGroups: Array<{
  ids: string[];
  icon: IconType;
  tone: string;
}> = [
  {
    ids: ["electronics", "other-electronics"],
    icon: Cpu,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    ids: ["phones-tablets", "phones", "other-phones-tablets"],
    icon: Smartphone,
    tone: "bg-cyan-50 text-cyan-700",
  },
  { ids: ["tablets"], icon: Tablet, tone: "bg-cyan-50 text-cyan-700" },
  { ids: ["smart-watches"], icon: Watch, tone: "bg-cyan-50 text-cyan-700" },
  {
    ids: ["phone-accessories"],
    icon: Cable,
    tone: "bg-cyan-50 text-cyan-700",
  },
  { ids: ["computers"], icon: Laptop, tone: "bg-blue-50 text-blue-700" },
  { ids: ["tvs-video"], icon: Tv, tone: "bg-indigo-50 text-indigo-700" },
  { ids: ["audio"], icon: Headphones, tone: "bg-purple-50 text-purple-700" },
  { ids: ["cameras"], icon: Camera, tone: "bg-fuchsia-50 text-fuchsia-700" },
  { ids: ["gaming"], icon: Gamepad2, tone: "bg-violet-50 text-violet-700" },
  { ids: ["networking"], icon: Router, tone: "bg-sky-50 text-sky-700" },
  {
    ids: ["printers-scanners"],
    icon: Printer,
    tone: "bg-slate-100 text-slate-700",
  },

  { ids: ["vehicles", "cars"], icon: Car, tone: "bg-orange-50 text-orange-700" },
  { ids: ["motorcycles"], icon: Bike, tone: "bg-orange-50 text-orange-700" },
  {
    ids: ["trucks-commercial-vehicles"],
    icon: Truck,
    tone: "bg-orange-50 text-orange-700",
  },
  { ids: ["buses-vans"], icon: BusFront, tone: "bg-orange-50 text-orange-700" },
  {
    ids: ["vehicle-parts", "vehicle-accessories"],
    icon: CircleGauge,
    tone: "bg-orange-50 text-orange-700",
  },

  {
    ids: ["property", "commercial-property", "other-property"],
    icon: Building2,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    ids: [
      "apartments-for-sale",
      "houses-for-sale",
      "apartments-for-rent",
      "houses-for-rent",
    ],
    icon: House,
    tone: "bg-emerald-50 text-emerald-700",
  },
  { ids: ["land-plots"], icon: LandPlot, tone: "bg-lime-50 text-lime-700" },
  { ids: ["rooms-shared"], icon: BedDouble, tone: "bg-emerald-50 text-emerald-700" },
  { ids: ["short-lets"], icon: Hotel, tone: "bg-emerald-50 text-emerald-700" },

  {
    ids: ["home", "home-furniture-appliances", "furniture"],
    icon: Armchair,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    ids: ["kitchen-appliances"],
    icon: Refrigerator,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    ids: ["home-appliances"],
    icon: WashingMachine,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    ids: ["home-decor", "lighting"],
    icon: Lamp,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    ids: ["garden-outdoor"],
    icon: Flower2,
    tone: "bg-green-50 text-green-700",
  },
  {
    ids: ["other-home-furniture-appliances"],
    icon: Sofa,
    tone: "bg-amber-50 text-amber-700",
  },

  {
    ids: [
      "fashion",
      "womens-fashion",
      "mens-fashion",
      "childrens-clothing",
      "other-fashion",
    ],
    icon: Shirt,
    tone: "bg-pink-50 text-pink-700",
  },
  { ids: ["shoes"], icon: Footprints, tone: "bg-pink-50 text-pink-700" },
  {
    ids: ["bags-accessories"],
    icon: ShoppingBag,
    tone: "bg-pink-50 text-pink-700",
  },
  { ids: ["watches-jewelry"], icon: Gem, tone: "bg-pink-50 text-pink-700" },

  {
    ids: ["beauty-personal-care", "skincare", "other-beauty-personal-care"],
    icon: Sparkles,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    ids: ["haircare", "beauty-tools"],
    icon: Scissors,
    tone: "bg-rose-50 text-rose-700",
  },
  { ids: ["makeup"], icon: Palette, tone: "bg-rose-50 text-rose-700" },
  { ids: ["fragrances"], icon: SprayCan, tone: "bg-rose-50 text-rose-700" },
  { ids: ["personal-care"], icon: Bath, tone: "bg-rose-50 text-rose-700" },

  {
    ids: ["babies-kids", "baby-gear", "maternity", "other-babies-kids"],
    icon: Baby,
    tone: "bg-sky-50 text-sky-700",
  },
  { ids: ["baby-clothing"], icon: Shirt, tone: "bg-sky-50 text-sky-700" },
  { ids: ["toys-games"], icon: ToyBrick, tone: "bg-sky-50 text-sky-700" },
  { ids: ["feeding"], icon: CookingPot, tone: "bg-sky-50 text-sky-700" },
  { ids: ["nursery"], icon: BedDouble, tone: "bg-sky-50 text-sky-700" },

  {
    ids: ["animals-pets", "pet-supplies", "other-pets"],
    icon: PawPrint,
    tone: "bg-teal-50 text-teal-700",
  },
  { ids: ["dogs"], icon: Dog, tone: "bg-teal-50 text-teal-700" },
  { ids: ["cats"], icon: Cat, tone: "bg-teal-50 text-teal-700" },
  { ids: ["birds"], icon: Bird, tone: "bg-teal-50 text-teal-700" },
  { ids: ["livestock"], icon: Tractor, tone: "bg-teal-50 text-teal-700" },

  {
    ids: ["food-agriculture-farming", "food-beverages"],
    icon: ShoppingBasket,
    tone: "bg-green-50 text-green-700",
  },
  { ids: ["crops-produce"], icon: Leaf, tone: "bg-green-50 text-green-700" },
  { ids: ["farm-machinery"], icon: Tractor, tone: "bg-green-50 text-green-700" },
  { ids: ["livestock-poultry"], icon: PawPrint, tone: "bg-green-50 text-green-700" },
  {
    ids: ["seeds-fertilizer", "animal-feed", "other-food-agriculture-farming"],
    icon: Wheat,
    tone: "bg-green-50 text-green-700",
  },

  { ids: ["jobs", "other-jobs"], icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-700" },
  { ids: ["software-it"], icon: Laptop, tone: "bg-blue-50 text-blue-700" },
  { ids: ["sales-marketing"], icon: Megaphone, tone: "bg-blue-50 text-blue-700" },
  { ids: ["finance-accounting"], icon: Receipt, tone: "bg-blue-50 text-blue-700" },
  { ids: ["engineering"], icon: Construction, tone: "bg-blue-50 text-blue-700" },
  { ids: ["healthcare"], icon: Stethoscope, tone: "bg-blue-50 text-blue-700" },
  { ids: ["education"], icon: GraduationCap, tone: "bg-blue-50 text-blue-700" },
  { ids: ["hospitality"], icon: Hotel, tone: "bg-blue-50 text-blue-700" },
  { ids: ["trades-labor"], icon: Hammer, tone: "bg-blue-50 text-blue-700" },
  { ids: ["admin-office"], icon: ClipboardList, tone: "bg-blue-50 text-blue-700" },

  { ids: ["services", "other-services"], icon: Wrench, tone: "bg-sky-50 text-sky-700" },
  { ids: ["it-services"], icon: Laptop, tone: "bg-sky-50 text-sky-700" },
  { ids: ["home-services"], icon: House, tone: "bg-sky-50 text-sky-700" },
  { ids: ["automotive-services"], icon: Car, tone: "bg-sky-50 text-sky-700" },
  { ids: ["business", "business-services"], icon: BriefcaseBusiness, tone: "bg-sky-50 text-sky-700" },
  { ids: ["event-services"], icon: Presentation, tone: "bg-sky-50 text-sky-700" },
  { ids: ["beauty-services"], icon: Scissors, tone: "bg-sky-50 text-sky-700" },
  { ids: ["lessons-training"], icon: GraduationCap, tone: "bg-sky-50 text-sky-700" },
  { ids: ["logistics-delivery"], icon: Truck, tone: "bg-sky-50 text-sky-700" },

  {
    ids: ["repair-construction", "construction-services", "other-repair-construction"],
    icon: HardHat,
    tone: "bg-yellow-50 text-yellow-700",
  },
  {
    ids: ["building-materials"],
    icon: Construction,
    tone: "bg-yellow-50 text-yellow-700",
  },
  {
    ids: ["construction-tools"],
    icon: Drill,
    tone: "bg-yellow-50 text-yellow-700",
  },
  {
    ids: ["electrical-plumbing"],
    icon: Plug,
    tone: "bg-yellow-50 text-yellow-700",
  },
  {
    ids: ["doors-windows"],
    icon: DoorOpen,
    tone: "bg-yellow-50 text-yellow-700",
  },
  { ids: ["roofing"], icon: House, tone: "bg-yellow-50 text-yellow-700" },

  {
    ids: [
      "business-industry",
      "commercial-equipments-tools",
      "industrial-machinery",
      "manufacturing-materials-supplies",
      "other-commercial-equipment",
      "other-business-industry",
    ],
    icon: Factory,
    tone: "bg-slate-100 text-slate-700",
  },
  { ids: ["power-tools"], icon: Drill, tone: "bg-slate-100 text-slate-700" },
  { ids: ["hand-tools"], icon: Hammer, tone: "bg-slate-100 text-slate-700" },
  { ids: ["generators"], icon: Plug, tone: "bg-slate-100 text-slate-700" },
  { ids: ["measuring-tools"], icon: Ruler, tone: "bg-slate-100 text-slate-700" },
  { ids: ["medical-equipment"], icon: Stethoscope, tone: "bg-slate-100 text-slate-700" },
  { ids: ["printing-equipment", "office-equipment"], icon: Printer, tone: "bg-slate-100 text-slate-700" },
  { ids: ["restaurant-equipment"], icon: ChefHat, tone: "bg-slate-100 text-slate-700" },
  { ids: ["retail-store-equipment"], icon: Store, tone: "bg-slate-100 text-slate-700" },
  { ids: ["safety-equipment"], icon: HardHat, tone: "bg-slate-100 text-slate-700" },
  { ids: ["salon-beauty-equipment"], icon: Scissors, tone: "bg-slate-100 text-slate-700" },
  { ids: ["stage-event-equipment"], icon: Music, tone: "bg-slate-100 text-slate-700" },

  {
    ids: ["leisure-activities", "sports-fitness", "other-leisure-activities"],
    icon: Dumbbell,
    tone: "bg-violet-50 text-violet-700",
  },
  { ids: ["musical-instruments"], icon: Music, tone: "bg-violet-50 text-violet-700" },
  { ids: ["books-media"], icon: BookOpen, tone: "bg-violet-50 text-violet-700" },
  { ids: ["hobbies-collectibles"], icon: Palette, tone: "bg-violet-50 text-violet-700" },
  { ids: ["outdoor-camping"], icon: TentTree, tone: "bg-violet-50 text-violet-700" },
  { ids: ["tickets-events"], icon: Presentation, tone: "bg-violet-50 text-violet-700" },
];

const visualsById = new Map<string, CategoryVisual>(
  visualGroups.flatMap(({ ids, icon: Icon, tone }) =>
    ids.map((id) => [id, { Icon, tone }]),
  ),
);

const photoGroups: Array<{ asset: string; ids: string[] }> = [
  { asset: "electronics", ids: ["electronics", "other-electronics"] },
  { asset: "phones-tablets", ids: ["phones-tablets", "other-phones-tablets"] },
  { asset: "phones", ids: ["phones"] },
  { asset: "tablets", ids: ["tablets"] },
  { asset: "smart-watches", ids: ["smart-watches"] },
  { asset: "phone-accessories", ids: ["phone-accessories"] },
  { asset: "computers", ids: ["computers"] },
  { asset: "tvs-video", ids: ["tvs-video"] },
  { asset: "audio", ids: ["audio"] },
  { asset: "cameras", ids: ["cameras"] },
  { asset: "gaming", ids: ["gaming"] },
  { asset: "networking", ids: ["networking"] },
  { asset: "printers-scanners", ids: ["printers-scanners"] },
  { asset: "vehicles", ids: ["vehicles"] },
  { asset: "cars", ids: ["cars"] },
  { asset: "motorcycles", ids: ["motorcycles"] },
  { asset: "trucks-commercial-vehicles", ids: ["trucks-commercial-vehicles"] },
  { asset: "buses-vans", ids: ["buses-vans"] },
  { asset: "vehicle-parts", ids: ["vehicle-parts", "vehicle-accessories"] },
  { asset: "property", ids: ["property", "other-property"] },
  {
    asset: "apartments-houses",
    ids: [
      "apartments-for-sale",
      "houses-for-sale",
      "apartments-for-rent",
      "houses-for-rent",
      "short-lets",
    ],
  },
  { asset: "land-plots", ids: ["land-plots"] },
  { asset: "commercial-property", ids: ["commercial-property"] },
  { asset: "rooms-shared", ids: ["rooms-shared"] },
  {
    asset: "home-furniture-appliances",
    ids: [
      "home",
      "home-furniture-appliances",
      "furniture",
      "home-decor",
      "lighting",
      "other-home-furniture-appliances",
    ],
  },
  { asset: "kitchen-appliances", ids: ["kitchen-appliances"] },
  { asset: "home-appliances", ids: ["home-appliances"] },
  { asset: "garden-outdoor", ids: ["garden-outdoor"] },
  {
    asset: "fashion",
    ids: [
      "fashion",
      "womens-fashion",
      "mens-fashion",
      "shoes",
      "bags-accessories",
      "watches-jewelry",
      "childrens-clothing",
      "other-fashion",
    ],
  },
  {
    asset: "beauty-personal-care",
    ids: [
      "beauty-personal-care",
      "skincare",
      "haircare",
      "makeup",
      "fragrances",
      "personal-care",
      "beauty-tools",
      "other-beauty-personal-care",
    ],
  },
  {
    asset: "babies-kids",
    ids: [
      "babies-kids",
      "baby-clothing",
      "baby-gear",
      "maternity",
      "feeding",
      "nursery",
      "toys-games",
      "other-babies-kids",
    ],
  },
  {
    asset: "animals-pets",
    ids: [
      "animals-pets",
      "dogs",
      "cats",
      "birds",
      "livestock",
      "pet-supplies",
      "other-pets",
    ],
  },
  {
    asset: "food-agriculture-farming",
    ids: [
      "food-agriculture-farming",
      "food-beverages",
      "crops-produce",
      "seeds-fertilizer",
      "farm-machinery",
      "livestock-poultry",
      "animal-feed",
      "other-food-agriculture-farming",
    ],
  },
  {
    asset: "jobs",
    ids: [
      "jobs",
      "software-it",
      "admin-office",
      "sales-marketing",
      "finance-accounting",
      "engineering",
      "healthcare",
      "education",
      "hospitality",
      "trades-labor",
      "other-jobs",
    ],
  },
  {
    asset: "services",
    ids: [
      "services",
      "home-services",
      "it-services",
      "automotive-services",
      "business-services",
      "event-services",
      "beauty-services",
      "lessons-training",
      "logistics-delivery",
      "other-services",
    ],
  },
  {
    asset: "repair-construction",
    ids: [
      "repair-construction",
      "building-materials",
      "construction-tools",
      "electrical-plumbing",
      "construction-services",
      "doors-windows",
      "roofing",
      "other-repair-construction",
    ],
  },
  {
    asset: "business-industry",
    ids: [
      "business",
      "business-industry",
      "commercial-equipments-tools",
      "industrial-machinery",
      "manufacturing-materials-supplies",
      "restaurant-equipment",
      "office-equipment",
      "medical-equipment",
      "printing-equipment",
      "power-tools",
      "hand-tools",
      "generators",
      "safety-equipment",
      "measuring-tools",
      "other-commercial-equipment",
      "other-business-industry",
    ],
  },
  {
    asset: "leisure-activities",
    ids: [
      "leisure-activities",
      "sports-fitness",
      "musical-instruments",
      "books-media",
      "outdoor-camping",
      "hobbies-collectibles",
      "tickets-events",
      "other-leisure-activities",
    ],
  },
];

const photosById = new Map(
  photoGroups.flatMap(({ asset, ids }) =>
    ids.map(
      (id) => [
        id,
        `https://assets.marketlift.com.br/categories/photographic/v1/${asset}.webp`,
      ] as const,
    ),
  ),
);

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
  const reviewed = visualsById.get(String(category.id || "").trim());
  if (reviewed) return reviewed;

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

export function CategoryArtwork({
  category,
  iconClassName = "size-10",
}: {
  category: CategoryLike;
  iconClassName?: string;
}) {
  const { Icon, tone } = resolveCategoryVisual(category);
  const photo = photosById.get(String(category.id || "").trim());

  return (
    <div className={`relative grid size-full place-items-center overflow-hidden ${tone}`}>
      <span
        className="absolute -right-6 -top-7 size-24 rounded-full bg-current opacity-[0.06]"
        aria-hidden="true"
      />
      <span
        className="absolute -bottom-8 -left-5 size-20 rounded-full bg-current opacity-[0.05]"
        aria-hidden="true"
      />
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, 180px"
          className="relative z-10 object-contain p-2 drop-shadow-sm"
        />
      ) : (
        <Icon
          className={`relative z-10 stroke-[1.65] drop-shadow-sm ${iconClassName}`}
          aria-hidden={true}
        />
      )}
    </div>
  );
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
