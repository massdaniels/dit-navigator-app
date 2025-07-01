const isMobile =
  typeof globalThis === "undefined" ? false : globalThis.innerWidth < 640;

const config = {
  geoCodingApi: "",
  routingApi: "",
  mapConfig: {
    center: [39.28015, -6.81409],
    zoom: isMobile ? 17 : 18.5,
    bearing: 60,
    pitch: 40,
    maxBounds: [
      [39.26977, -6.81708],
      [39.29134, -6.81043],

    ],
  } as maplibregl.MapOptions,
  mapStyles: {
    light: "https://tiles.openfreemap.org/styles/bright",
    dark: "/styles/dark/style.json",
  },
};

export default config;
