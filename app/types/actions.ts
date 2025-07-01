// app/types/actions.ts

import { type MapFeature } from "./geojson";

// For Category Actions (from previous example)
interface CategorySuccessResponse {
  success: true;
  category: any;
}

interface CategoryErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    name?: string[];
    description?: string[];
    [key: string]: any;
  };
}
export type MutateCategoryActionResponse = CategorySuccessResponse | CategoryErrorResponse;


interface DeleteCategorySuccessResponse {
  success: true;
  message: string;
}

interface DeleteCategoryErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    [key: string]: any;
  };
}
export type DeleteCategoryActionResponse = DeleteCategorySuccessResponse | DeleteCategoryErrorResponse;


// NEW: For Map Feature Actions
interface MapFeatureSuccessResponse {
  success: true;
  feature: MapFeature;
}

interface MapFeatureErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    name?: string[];
    categoryName?: string[];
    height?: string[];
    geometryType?: string[];
    coordinates?: string[];
    show?: string[];
    [key: string]: any;
  };
}

export type MutateMapFeatureActionResponse = MapFeatureSuccessResponse | MapFeatureErrorResponse;

interface DeleteMapFeatureSuccessResponse {
  success: true;
  message: string;
}

interface DeleteMapFeatureErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    [key: string]: any;
  };
}
export type DeleteMapFeatureActionResponse = DeleteMapFeatureSuccessResponse | DeleteMapFeatureErrorResponse;


// --- NEW: For POI Actions ---
import { type PoiFeature } from "./geojson";

interface PoiSuccessResponse {
  success: true;
  poi: PoiFeature;
}

interface PoiErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    name?: string[];
    category?: string[];
    floor?: string[];
    coordinates?: string[];
    [key: string]: any;
  };
}

export type MutatePoiActionResponse = PoiSuccessResponse | PoiErrorResponse;

interface DeletePoiSuccessResponse {
  success: true;
  message: string;
}

interface DeletePoiErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    [key: string]: any;
  };
}
export type DeletePoiActionResponse = DeletePoiSuccessResponse | DeletePoiErrorResponse;




// --- NEW: For Route Actions ---
import { type RouteFeature } from "./geojson";

interface RouteSuccessResponse {
  success: true;
  route: RouteFeature;
}

interface RouteErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    name?: string[];
    coordinates?: string[];
    [key: string]: any;
  };
}

export type MutateRouteActionResponse = RouteSuccessResponse | RouteErrorResponse;

interface DeleteRouteSuccessResponse {
  success: true;
  message: string;
}

interface DeleteRouteErrorResponse {
  success: false;
  errors: {
    formErrors?: string[];
    [key: string]: any;
  };
}
export type DeleteRouteActionResponse = DeleteRouteSuccessResponse | DeleteRouteErrorResponse;