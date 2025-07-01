
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { QrScannerDialog } from "~/components/dashboard/qr-scanner-dialog";
import MapComponent from "~/components/map-component"; // Ensure this path is correct
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { getMapFeatures } from "~/lib/geojson.server";
import { getPoiFeatures } from "~/lib/poi-geojson.server";
import { getRouteFeatures } from "~/lib/route-geojson.server";
import { createMeta } from "~/utils/metadata";

export const meta = () => createMeta("Map Viewer", "DITNavigatorApp Is an Application that is capable of simplifying the process of navigating within DIT Campus");

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");

  let qrLat: number | undefined;
  let qrLon: number | undefined;

  if (latParam && lonParam) {
    const parsedLat = parseFloat(latParam);
    const parsedLon = parseFloat(lonParam);
    if (!isNaN(parsedLat) && !isNaN(parsedLon) && parsedLat >= -90 && parsedLat <= 90 && parsedLon >= -180 && parsedLon <= 180) {
      qrLat = parsedLat;
      qrLon = parsedLon;
    }
  }

  const mapFeatures = await getMapFeatures({ show: true });
  const poiFeatures = await getPoiFeatures();
  const routeFeatures = await getRouteFeatures();

  // --- ADD THIS CONSOLE.LOG ---
  console.log("Loader: Parsed QR Lat:", qrLat, "QR Lon:", qrLon);

  return json({
    mapFeatures: Array.isArray(mapFeatures) ? mapFeatures : [],
    poiFeatures: Array.isArray(poiFeatures) ? poiFeatures : [],
    routeFeatures: Array.isArray(routeFeatures) ? routeFeatures : [],
    qrLat,
    qrLon,
  });
}

export default function Index() {
  const { mapFeatures, poiFeatures, routeFeatures, qrLat, qrLon } = useLoaderData<typeof loader>();
  const [isScannerOpen, setIsScannerOpen] = useState(false); // State to control scanner dialog
  const navigate = useNavigate(); // Hook for navigation


    // Function to handle successful QR code scan
  const handleQrScanSuccess = (decodedText: string) => {
    console.log("QR Code Scanned:", decodedText);

    try {
      const url = new URL(decodedText);
      const latParam = url.searchParams.get("lat");
      const lonParam = url.searchParams.get("lon");

      if (latParam && lonParam) {
        const parsedLat = parseFloat(latParam);
        const parsedLon = parseFloat(lonParam);

        if (!isNaN(parsedLat) && !isNaN(parsedLon) && parsedLat >= -90 && parsedLat <= 90 && parsedLon >= -180 && parsedLon <= 180) {
          // If valid coordinates are found, navigate to update the URL
          // This will trigger the loader to re-run and pass new qrLat/qrLon to MapComponent
          navigate(`?lat=${parsedLat}&lon=${parsedLon}`);
          setIsScannerOpen(false); // Ensure dialog closes
          return;
        }
      }
      // If no valid lat/lon in URL or other issue
      alert("QR code does not contain valid location coordinates in the expected format.");
    } catch (error) {
      console.error("Error parsing QR code URL:", error);
      alert("Invalid QR code format. Please scan a valid URL.");
    }
    setIsScannerOpen(false); // Close dialog even on error
  };

    const handleQrScanError = (errorMessage: string) => {
    // console.error("QR Scan Error:", errorMessage);
    // You might want to show a toast or a less intrusive message to the user
  };
  // --- ADD THIS CONSOLE.LOG ---
  console.log("Index Component: Received QR Lat:", qrLat, "QR Lon:", qrLon);

  return (
    <div className="flex relative  h-svh flex-col items-center justify-center">
      <Analytics />
      {/* QR Scanner Button - positioned absolutely at top-right */}
      <Toggle
        variant="outline"
        size="icon" // Makes the button small and icon-sized
        className="absolute top-4 right-4 z-20 rounded-full shadow-md" // Position and styling
        onClick={() => setIsScannerOpen(true)}
      >
        <QrCode size={20} /> {/* Adjust icon size if needed */}
      </Toggle>
      <MapComponent
        mapFeatures={mapFeatures}
        poiFeatures={poiFeatures}
        routeFeatures={routeFeatures}
        qrLat={qrLat}
        qrLon={qrLon}
      />
      <QrScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanSuccess={handleQrScanSuccess}
        onScanError={handleQrScanError}
      />
    </div>
  );
}