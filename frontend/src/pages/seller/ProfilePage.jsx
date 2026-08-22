import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { sellerService } from "@/api/index";
import { sellerProfileUpdateSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/formatters";
import useAuthStore from "@/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import { productService } from "@/api/index";
import ShopHeader from "@/components/seller/ShopHeader";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import ImageCropModal from "@/components/common/ImageCropModal";

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const { seller, updateSellerState } = useAuthStore();
  const [activeModal, setActiveModal] = useState(null); // "avatar" | "banner" | "profile" | null

  const {
    page,
    limit,
    params,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchProducts = useCallback(() => {
    setIsLoadingProducts(true);
    sellerService
      .getDashboard()
      .then((res) => {
        updateSellerState(res.data.data.seller);
      })
      .catch(() => { })
      .finally(() => setIsLoadingProducts(false));
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!seller) return null;

  return (
    <div className="flex flex-col">
      <ShopHeader
        seller={seller}
        isOwner
        onEditBanner={() => setActiveModal("banner")}
        onEditAvatar={() => setActiveModal("avatar")}
        onEditDescription={() => setActiveModal("profile")}
        onOpenLocation={() => setActiveModal("location")}
        onAddProduct={() => navigate("/seller/products")}
      />

      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
            Your products
          </h2>
          <Button
            type="primary"
            onClick={() => setActiveModal("profile")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Edit profile
          </Button>
        </div>
        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          emptyTitle="No products yet"
          emptyDescription="Add products from the Manage Products page."
        />
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onNext={nextPage}
            onPrev={prevPage}
            onGoTo={goToPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      </div>

      <AvatarBannerModal
        type="avatar"
        isOpen={activeModal === "avatar"}
        onClose={() => setActiveModal(null)}
        onSaved={(url) => updateSellerState({ avatar: url })}
      />
      <AvatarBannerModal
        type="banner"
        isOpen={activeModal === "banner"}
        onClose={() => setActiveModal(null)}
        onSaved={(url) => updateSellerState({ banner: url })}
      />
      <ProfileModal
        isOpen={activeModal === "profile"}
        onClose={() => setActiveModal(null)}
        seller={seller}
        onSaved={(fields) => updateSellerState(fields)}
      />
    </div>
  );
}

export function AvatarBannerModal({ type, isOpen, onClose, onSaved }) {

  const [pendingFile, setPendingFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAvatar = type === "avatar";

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!selected) return;
    const errorMessage = validateImageFile(selected, 5);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    setPendingFile(selected);
  };

  const handleCropConfirm = async (blob) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const filename = `${type}.jpg`;
      formData.append(type, blob, filename);
      const res = isAvatar
        ? await sellerService.updateAvatar(formData)
        : await sellerService.updateBanner(formData);
      const url = res.data.data[type];
      toast.success(`${isAvatar ? "Avatar" : "Banner"} updated`);
      onSaved(url);
      setPendingFile(null);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !pendingFile}
        onClose={onClose}
        title={isAvatar ? "Update avatar" : "Update banner"}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ImageCropModal
        isOpen={!!pendingFile}
        file={pendingFile}
        aspect={isAvatar ? 1 : 3 / 1}
        shape={isAvatar ? "circle" : "rect"}
        onClose={() => setPendingFile(null)}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}

// Only the fields the seller is allowed to self-update from this modal.
// (cityId is deliberately excluded here — handle it via onOpenLocation/location flow.)
const PROFILE_FIELDS = [
  { name: "shopDescription", label: "Shop description", type: "textarea" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "whatsappNumber", label: "WhatsApp number", type: "text" },
  { name: "altPhone", label: "Alternate phone", type: "text" },
];

function ProfileModal({ isOpen, onClose, seller, onSaved }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerProfileUpdateSchema),
    defaultValues: getDefaults(seller),
  });

  // Reset form values whenever the modal is (re)opened with fresh seller data.
  useEffect(() => {
    if (isOpen) reset(getDefaults(seller));
  }, [isOpen, seller, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Drop empty-string fields so optional validators aren't tripped
      // and we don't overwrite existing values with blanks.
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== ""),
      );
      const res = await sellerService.updateProfile(payload);
      const updated = res?.data?.data?.seller || payload;
      toast.success("Profile updated");
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" size="md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1"
      >
        {PROFILE_FIELDS.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-text-muted mb-1">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                rows={3}
                className="w-full rounded-md border border-border bg-surface-raised text-sm text-text p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                {...register(field.name)}
              />
            ) : (
              <Input type="text" {...register(field.name)} />
            )}
            {errors[field.name] && (
              <p className="text-xs text-error mt-1">
                {errors[field.name].message}
              </p>
            )}
          </div>
        ))}
        <div className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-sm text-text-secondary">
          <span className="font-medium text-text">Note:</span>{" "}
          You can update the information above. If you wish to change any
          other profile details, please contact the ClothMarket team for
          assistance.
        </div>
        <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-surface pb-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaults(seller) {
  return PROFILE_FIELDS.reduce((acc, { name }) => {
    acc[name] = seller?.[name] || "";
    return acc;
  }, {});
}
