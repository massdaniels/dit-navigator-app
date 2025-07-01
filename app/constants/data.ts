import { NavItem } from "~/types";

export const navItems: NavItem[] = [
  {
    title: "Map Viewer",
    href: "/dashboard/map-editor",
    icon: "map",
    label: "Map",
    alwaysShow: true,
  },
  {
    title: "Features",
    href: "/dashboard/map-features",
    icon: "block",
    label: "blocks",
  },
  {
    title: "Routes",
    href: "/dashboard/routes",
    icon: "route",
    label: "routes",
  },
    {
    title: "POIs",
    href: "/dashboard/pois",
    icon: "pointer",
    label: "POIs",
    alwaysShow: true,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: "location",
    label: "Categories",
    alwaysShow: true,
  },
    {
    title: "QR-Code",
    href: "/dashboard/qr-code",
    icon: "qrcode",
    label: "QR-Code",
    alwaysShow: true,
  },
  {
    title: "Admins",
    href: "/dashboard/admins-list",
    icon: "profile",
    label: "admins",
    alwaysShow: true,
  },
      {
    title: "Feedback",
    href: "/dashboard/feedback",
    icon: "feedback",
    label: "feedback",
    alwaysShow: true,
  },
];

export type Building = {
  id: string;
  name: string;
  type?: string | null;
  height: number;
};
