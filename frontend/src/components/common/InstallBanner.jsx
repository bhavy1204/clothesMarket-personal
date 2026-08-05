import { useEffect, useState } from "react";
import usePWAInstall from "../../hooks/usePWAInstall";
import { X, DownloadSimple } from "@phosphor-icons/react";
import Button from "./Button";

export default function InstallBanner() {
  const {
    install,

    isInstallable,

    isInstalled,

    isIOS,
  } = usePWAInstall();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    const alreadyShown = localStorage.getItem("install-banner");

    if (!alreadyShown && (isInstallable || isIOS)) {
      setVisible(true);

      localStorage.setItem("install-banner", "true");
    }
  }, [isInstallable, isIOS, isInstalled]);

  if (!visible || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between p-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <DownloadSimple size={24} weight="bold" className="text-primary" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-text">
              Install ClothesMarket
            </h3>

            <p className="mt-1 text-sm leading-6 text-text-muted">
              Shop faster, access stores instantly and enjoy a smoother app-like
              experience.
            </p>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-raised hover:text-text"
        >
          <X size={18} />
        </button>
      </div>

      <div className="border-t border-border px-5 py-4">
        {!isIOS && isInstallable && (
          <Button onClick={install} fullWidth>
            Install App
          </Button>
        )}

        {isIOS && (
          <div className="rounded-xl bg-surface-raised p-3 text-sm text-text-muted">
            Tap <span className="font-semibold text-text">Share</span> and
            choose{" "}
            <span className="font-semibold text-text">Add to Home Screen</span>.
          </div>
        )}
      </div>
    </div>
  );
}
