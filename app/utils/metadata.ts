import type { MetaFunction } from "@remix-run/node";

export const createMeta = (title: string, description?: string) => {
  const fullTitle = ` DITNavigatorApp | ${title}`;
  
  return [
    { title: fullTitle },
    { name: "description", content: description || "" },
  ] satisfies ReturnType<MetaFunction>;
};