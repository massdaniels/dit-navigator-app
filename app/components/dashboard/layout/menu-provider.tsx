import React, { createContext, useContext, useState, useEffect } from "react";
import { NavItem } from "~/types";
import { navItems as defaultNavItems } from "~/constants/data";

const defaultSessionValue = {
  navItems: [] as NavItem[],
  updateNaviItems: async () => {}, // placeholder function
};

const MenuContext = createContext(defaultSessionValue);

export const MenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {

    setNavItems(defaultNavItems);
  }, []);

  return (
    <MenuContext.Provider
      value={{
        navItems,
        updateNaviItems: async () => {

          setNavItems(defaultNavItems);
        },
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
