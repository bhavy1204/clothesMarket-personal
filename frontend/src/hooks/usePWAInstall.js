import { useEffect, useState } from "react";

export default function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const [isInstallable, setIsInstallable] = useState(false);

    const [isInstalled, setIsInstalled] = useState(
        window.matchMedia("(display-mode: standalone)").matches
    );

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    useEffect(() => {

        const beforeInstallHandler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

            setIsInstallable(true);
        };

        const installedHandler = () => {

            setDeferredPrompt(null);

            setIsInstallable(false);

            setIsInstalled(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            beforeInstallHandler
        );

        window.addEventListener(
            "appinstalled",
            installedHandler
        );

        return () => {

            window.removeEventListener(
                "beforeinstallprompt",
                beforeInstallHandler
            );

            window.removeEventListener(
                "appinstalled",
                installedHandler
            );

        };

    }, []);

    const install = async () => {

        if (!deferredPrompt) return false;

        deferredPrompt.prompt();

        const { outcome } =
            await deferredPrompt.userChoice;

        setDeferredPrompt(null);

        setIsInstallable(false);

        return outcome === "accepted";
    };

    return {

        install,

        isInstallable,

        isInstalled,

        isIOS

    };
}


