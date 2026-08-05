import usePWAInstall from "../../hooks/usePWAInstall";
import {
  DownloadSimple,
  DeviceMobile,
  ShareNetwork,
  X,
} from "@phosphor-icons/react";
import Button from "./Button";

export default function InstallModal({ open, onClose }) {
  const {
    install,

    isInstallable,

    isIOS,
  } = usePWAInstall();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <DownloadSimple
                size={28}
                weight="fill"
                className="text-primary"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-text">
                Install ClothesMarket
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Get a faster, smoother and app-like shopping experience.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-surface-raised transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Benefits */}
        <div className="px-6 pt-5">
          <p className="font-medium text-text mb-3">Why install?</p>

          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex gap-3">Faster loading</li>

            <li className="flex gap-3">Better shopping experience</li>

            <li className="flex gap-3">Get future notifications</li>

            <li className="flex gap-3">Looks and feels like a native app</li>
          </ul>
        </div>

        {/* Android */}
        {!isIOS && isInstallable && (
          <div className="px-6 pt-6">
            <Button fullWidth onClick={install}>
              Install App
            </Button>
          </div>
        )}

        {/* iPhone */}
        {isIOS && (
          <div className="mx-6 mt-6 rounded-2xl bg-surface-raised p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShareNetwork size={20} className="text-primary" />

              <p className="font-medium">Install on iPhone</p>
            </div>

            <ol className="list-decimal list-inside text-sm text-text-muted space-y-2">
              <li>Tap the Share button in Safari.</li>

              <li>
                Select <b>Add to Home Screen</b>.
              </li>

              <li>
                Tap <b>Add</b>.
              </li>
            </ol>
          </div>
        )}

        {/* Browser doesn't support prompt */}

        {!isIOS && !isInstallable && (
          <div className="mx-6 mt-6 rounded-2xl bg-surface-raised p-4">
            <div className="flex items-center gap-2 mb-2">
              <DeviceMobile size={20} className="text-primary" />

              <p className="font-medium">Install manually</p>
            </div>

            <p className="text-sm text-text-muted">
              If the Install button isn't available, open your browser menu and
              choose
              <b> Install App</b> or
              <b> Add to Home Screen</b>.
            </p>
          </div>
        )}

        {/* Footer */}

        <div className="border-t border-border mt-6 p-6">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
