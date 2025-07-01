import { useState } from "react";
import { Theme, useTheme } from "remix-themes/build/theme-provider";

export default function NavigationSettings() {
  const [theme, setTheme] = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = event.target.value as "light" | "dark" | "system";
    if (selectedTheme === Theme.DARK || selectedTheme === Theme.LIGHT) {
      setTheme(selectedTheme as Theme);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-900">
      <span className="text-sm font-medium dark:text-gray-200">Theme</span>
      <select
        className="w-full rounded-md bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
        value={theme?.toString()}
        onChange={handleThemeChange}
      >
        <option value={Theme.LIGHT}>Light</option>
        <option value={Theme.DARK}>Dark</option>
      </select>
    </div>
  );
}
