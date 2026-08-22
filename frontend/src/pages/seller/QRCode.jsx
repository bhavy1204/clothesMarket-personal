import { useEffect, useState, useCallback } from "react";
import { sellerService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import Logo from "../../../assets/logo.png"
import Button from "@/components/common/Button";
import html2canvas from "html2canvas";

const QRCode = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { seller, updateSellerState } = useAuthStore();

    // Replace this with your actual seller/service import
    const fetchQrCode = useCallback(() => {
        setLoading(true)
        setError("")
        sellerService
            .getQrCode()
            .then((res) => {
                setQrCode(res.data.data.qrCode)
            }).catch((err) => {
                setError(err?.response?.data?.message || "Couldn't load your QR code")
            })
            .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        fetchQrCode();
    }, []);

    const handleDownload = async () => {
        const card = document.getElementById("seller-qr-card");
        if (!card) return;

        try {
            const canvas = await html2canvas(card, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const link = document.createElement("a");
            link.download = `${seller?.shopName || "shop"}-qr-card.png`;
            link.href = canvas.toDataURL("image/png", 1.0); 
            link.click();
        } catch (err) {
            console.error(err);
            toast.error("Couldn't download the QR card, please try again");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <p className="text-gray-500">Loading your QR card...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-red-500">{error}</p>

                    <button
                        onClick={fetchQrCode}
                        className="rounded-lg bg-black px-5 py-2 text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">

            {/* Page Header */}
            <div className="mx-auto mb-8 max-w-5xl">
                <h1 className="text-2xl font-bold text-text">
                    Your Shop QR Card
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                    Download and print this card to help customers find your shop.
                </p>
            </div>

            {/* Main Content */}
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">

                {/* QR Card Preview */}
                <div id="seller-qr-card" className="flex items-center justify-center rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">

                    <div
                        
                        className="w-full max-w-[650px] overflow-hidden rounded-3xl border border-border bg-surface-raised p-8"
                    >
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <img
                                src={Logo}
                                alt="ClothesMarket"
                                className="h-20 w-auto object-contain"
                            />
                        </div>

                        {/* Shop Information */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-text sm:text-3xl">
                                {seller.shopName}
                            </h2>
                            <p className="mt-1 text-sm text-text-muted sm:text-base">
                                {seller.fullName}
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="my-8 flex justify-center">
                            <div className="rounded-2xl border border-border bg-white p-1">
                                {qrCode ? (
                                    <img
                                        src={qrCode}
                                        alt="Shop QR Code"
                                        className="h-58 w-58 sm:h-56 sm:w-56"
                                    />
                                ) : (
                                    <div className="flex h-48 w-48 items-center justify-center bg-surface text-sm text-text-muted">
                                        QR Code
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Call To Action */}
                        <div className="text-center">
                            <p className="text-lg font-semibold text-text">
                                Scan to visit our shop
                            </p>
                            <p className="mt-1 text-sm text-text-muted">
                                Discover our latest collection
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4">
                            <span className="text-xs font-medium tracking-wide text-text-muted">
                                Powered by
                            </span>
                            <span className="text-sm font-bold text-primary">
                                ClothesMarket
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions / Information */}
                <div className="h-fit rounded-3xl border border-border bg-surface p-6 shadow-sm">

                    <h3 className="text-lg font-semibold text-text">
                        Download your card
                    </h3>

                    <div className="mt-6 space-y-3">
                        <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            onClick={handleDownload}
                        >
                            Download Card
                        </Button>

                        {/* <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handlePrint}
          >
            Print Card
          </Button> */}
                    </div>

                    {/* Small Info */}
                    <div className="mt-6 rounded-xl bg-primary/10 p-4 border border-primary/20">
                        <p className="text-xs leading-5 text-text-muted">
                            Download the QR card and keep it somewhere customers can easily see and scan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCode;