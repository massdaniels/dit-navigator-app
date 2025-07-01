import { Icons } from "~/components/dashboard/icons";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  alwaysShow?: boolean;
}

export type PageSearchFormValues = {
  page?: number;
  limit?: number;
  sort?: string;
};

export type BuildingSearchFormValues = {
  name?: string;
} & PageSearchFormValues;

export type CategorySearchFormValues = {
  categoryPoi?: string;
  categoryName?: string;
} & PageSearchFormValues;

export type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export type POI = {
  id: string;
  categoryPoi: string;
  poiValue: string;
  poiName: string;
  poiAlias?: string | null;
  displayOrder: number;
};
