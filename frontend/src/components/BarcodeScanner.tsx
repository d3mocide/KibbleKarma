import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

// Optional camera-based barcode scanner. Falls back gracefully if the
// browser has no camera or permission is denied.
export default function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const reader = new BrowserMultiFormatReader();
    let controls: { stop: () => void } | undefined;
    let stopped = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !stopped) {
          stopped = true;
          onDetected(result.getText());
          controls?.stop();
          setActive(false);
        }
      })
      .then((c) => {
        controls = c;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not access camera");
        setActive(false);
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [active, onDetected]);

  return (
    <div className="space-y-2">
      {!active ? (
        <button type="button" className="btn-secondary w-full" onClick={() => setActive(true)}>
          📷 Scan with camera
        </button>
      ) : (
        <div className="overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="w-full" />
          <button
            type="button"
            className="btn-ghost w-full text-white"
            onClick={() => setActive(false)}
          >
            Stop scanning
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
