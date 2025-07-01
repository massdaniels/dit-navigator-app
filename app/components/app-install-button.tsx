// app/components/InstallButton.tsx

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    }
  };

  if (!deferredPrompt) return null;

  return <Button size="sm" variant="primary" className="text-sm lg:rounded-full" onClick={handleInstall}><Download size={18}/><div className="hidden sm:block">Install App</div> </Button>;
}
