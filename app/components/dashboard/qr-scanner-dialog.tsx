// app/components/qr-scanner-dialog.tsx

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // No need for Html5QrcodeSupportedMethod unless you use it
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (errorMessage: string) => void;
}

const QR_CODE_SCANNER_ID = "qr-code-reader"; // Unique ID for the scanner element

export function QrScannerDialog({ open, onOpenChange, onScanSuccess, onScanError }: QrScannerDialogProps) {
  const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
  // Using a direct ref to the div element is a more robust way to ensure it's mounted.
  const qrCodeReaderElementRef = useRef<HTMLDivElement>(null);
  const [cameraStatus, setCameraStatus] = useState<string>('Initializing camera...');

  useEffect(() => {
    let animationFrameId: number | null = null; // To store requestAnimationFrame ID for cleanup

    // Only try to initialize scanner if dialog is open AND the target div element is mounted
    if (open) {
      setCameraStatus('Initializing camera...');

      // Use requestAnimationFrame to ensure the DOM has rendered the dialog content
      // before attempting to initialize the scanner.
      animationFrameId = requestAnimationFrame(() => {
        // Double-check if the dialog is still open and the element exists after the frame
        if (!open || !qrCodeReaderElementRef.current) {
            console.warn("QR scanner element not ready or dialog closed prematurely. Aborting scanner init.");
            setCameraStatus('Initialization aborted (element not ready)');
            return;
        }

        const onScanSuccessLocal = (decodedText: string, decodedResult: any) => {
          if (qrCodeScannerRef.current) {
            qrCodeScannerRef.current.clear().catch(e => console.error("Failed to clear scanner on success:", e));
          }
          onOpenChange(false); // Close the dialog
          onScanSuccess(decodedText, decodedResult); // Pass result to parent
        };

        const onScanErrorLocal = (errorMessage: string) => {
          console.warn(`QR Scan Error (onScanErrorLocal): ${errorMessage}`);

          if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
               setCameraStatus(`Camera access denied. Please grant permissions.`);
          } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("No camera found")) {
               setCameraStatus(`No camera found. Please ensure a camera is connected.`);
          } else if (errorMessage.includes("Could not start video source")) {
              setCameraStatus(`Could not start camera. Ensure it's not in use by another app.`);
          } else {
               setCameraStatus(`Scan error: ${errorMessage}`);
          }
          onScanError?.(errorMessage);
        };

        // Ensure previous scanner instance is cleared before initializing a new one
        if (qrCodeScannerRef.current) {
            qrCodeScannerRef.current.clear().catch(e => console.error("Failed to clear existing scanner:", e));
            qrCodeScannerRef.current = null;
        }

        // Initialize Html5QrcodeScanner instance
        // Pass the ID string (from the constant) to the scanner constructor
        qrCodeScannerRef.current = new Html5QrcodeScanner(
          QR_CODE_SCANNER_ID,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            
          },
          true // Verbose logging for debugging
        );

        try {
          qrCodeScannerRef.current.render(onScanSuccessLocal, onScanErrorLocal);
          setCameraStatus('Camera ready. Point to QR code.'); // Optimistic update
        } catch (err: any) {
          setCameraStatus(`Failed to start camera: ${err.message || err}. Please check permissions.`);
          console.error("Html5QrcodeScanner render call error:", err);
        }
      }); // End of requestAnimationFrame
    } else {
      // Dialog is closed, stop scanning and clean up
      if (animationFrameId) {
          cancelAnimationFrame(animationFrameId); // Cancel any pending animation frame
      }
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(e => console.error("Failed to clear scanner on dialog close:", e));
        qrCodeScannerRef.current = null; // Clear ref to allow re-initialization on next open
      }
      setCameraStatus('Initializing camera...'); // Reset status for next open
    }

    // Cleanup on component unmount or 'open' changes to false
    return () => {
      if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
      }
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(e => console.error("Failed to clear scanner on component unmount:", e));
        qrCodeScannerRef.current = null;
      }
    };
  }, [open, onOpenChange, onScanSuccess, onScanError]); // Dependencies

  return (
    // The Dialog component itself will handle rendering its content only when 'open' is true.
    // This ensures the 'qr-code-reader' div is in the DOM when the scanner tries to attach.
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col items-center">
        <DialogHeader className="text-center">
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at a QR code containing location coordinates.
          </DialogDescription>
        </DialogHeader>
        {/* The div for the scanner. Its ID is critical for Html5QrcodeScanner. */}
        {/* The ref is here mainly for the useEffect's check `qrCodeReaderElementRef.current`. */}
        {/* Html5QrcodeScanner manages the video element's display within this div. */}
        <div id={QR_CODE_SCANNER_ID} ref={qrCodeReaderElementRef} style={{ width: '100%', height: 'auto' }}>
          {/* Html5QrcodeScanner will render the video feed here */}
        </div>
        <p className="mt-4 text-sm text-center">{cameraStatus}</p>
        {(cameraStatus.includes('Failed to start camera') || cameraStatus.includes('access denied') || cameraStatus.includes('No camera found') || cameraStatus.includes('Could not start video source')) && (
            <p className="text-red-500 text-sm mt-2">
                Troubleshooting: Ensure your browser has camera access, the camera is connected, and it's not in use by another app.
            </p>
        )}
        <Button onClick={() => onOpenChange(false)} className="mt-4">Close Scanner</Button>
      </DialogContent>
    </Dialog>
  );
}