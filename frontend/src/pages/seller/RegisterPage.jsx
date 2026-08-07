import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Storefront,
  Envelope,
  LockKey,
  Phone,
  MapPin,
  User,
  MapPinArea,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService, sellerService } from "@/api/index";
import { sellerRegisterSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/formatters";
import useGeolocation from "@/lib/useGeoLocation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * Seller RegisterPage — /seller/register only, no nav link anywhere
 * pointing here (per your decision). FormData body carries avatar, banner,
 * and location (GeoJSON [lng, lat] — flipped from the hook's {lat, lng}).
 *
 * NOTE: field set assumed from your backend notes — shopName, email, phone,
 * username, password, confirmPassword, description, avatar, banner,
 * location. Adjust names to match sellerRegisterSchema exactly.
 */
export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const {
    coords,
    error: geoError,
    isLoading: isLocating,
    requestLocation,
  } = useGeolocation();

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerRegisterSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      cityId: "",
    },
  });

  useEffect(() => {
    adminService
      .getAllActiveCities()
      .then((res) => setCities(res.data?.data ?? []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load cities"),
      )
      .finally(() => setIsLoadingCities(false));
  }, []);

  const handleFileChange = (e, setFile) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMessage = validateImageFile(file, 5);
    if (errorMessage) {
      toast.error(errorMessage);
      e.target.value = "";
      return;
    }
    setFile(file);
  };

  const onSubmit = async (data) => {
    if (!coords) {
      toast.error("Please share your shop's location before continuing");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // GeoJSON is [lng, lat] — flipped from the hook's {lat, lng}
      formData.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        }),
      );

      if (avatarFile) formData.append("avatar", avatarFile);
      if (bannerFile) formData.append("banner", bannerFile);

      await sellerService.register(formData);
      toast.success("Shop registered — check your email for the OTP");
      navigate("/seller/verify-email", {
        state: { email: data.email },
        replace: true,
      });
    } catch (err) {
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);

      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sameAsPhone = watch("sameAsPhone");
  const phone = watch("phone");

  useEffect(() => {
    if (sameAsPhone) {
      setValue("whatsappNumber", phone, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [phone, sameAsPhone, setValue]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Register your shop</h1>
          <p className="text-sm text-text-muted mt-1">
            List your shop on ClothesMarket
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("FORM INVALID");
            console.log(errors);

            toast.error(JSON.stringify(errors, null, 2));
          })}
          className="flex flex-col gap-4"
          autoComplete="off"
        >
          <Input
            label="Shop name"
            leftIcon={<Storefront size={16} />}
            error={errors.shopName?.message}
            {...register("shopName")}
          />

          <Input
            label="Your full name"
            leftIcon={<User size={16} />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Username"
            helperText="Used for seller login (email works too)"
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label="Email"
            type="email"
            leftIcon={<Envelope size={16} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
  label="Phone number"
  type="tel"
  leftIcon={<Phone size={16} />}
  error={errors.phone?.message}
  {...register("phone")}
/>

<div className="flex items-center gap-2">
  <input
    id="sameAsPhone"
    type="checkbox"
    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    {...register("sameAsPhone")}
  />
  <label
    htmlFor="sameAsPhone"
    className="text-sm text-text-muted cursor-pointer"
  >
    Same as phone number
  </label>
</div>

<Input
  label="WhatsApp number"
  type="tel"
  helperText="Customers will contact you here"
  leftIcon={<Phone size={16} />}
  disabled={sameAsPhone}
  error={errors.whatsappNumber?.message}
  {...register("whatsappNumber")}
/>

          <Input
            label="Alternate phone (optional)"
            type="tel"
            leftIcon={<Phone size={16} />}
            error={errors.altPhone?.message}
            {...register("altPhone")}
          />

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              Shop description
            </label>
            <textarea
              rows={3}
              placeholder="What do you sell? Tell customers about your shop."
              className="w-full rounded-md border border-border bg-surface-raised text-sm text-text placeholder:text-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              {...register("shopDescription")}
            />
            {errors.shopDescription && (
              <p className="text-xs text-error mt-1">
                {errors.shopDescription.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              Shop category
            </label>
            <select
              className="w-full h-11 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              defaultValue=""
              {...register("shopCategory")}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="clothing">clothing</option>
              {/* <option value="womens-wear">Women's wear</option>
              <option value="kids-wear">Kids' wear</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
              <option value="ethnic-wear">Ethnic wear</option>
              <option value="other">Other</option> */}
            </select>
            {errors.shopCategory && (
              <p className="text-xs text-error mt-1">
                {errors.shopCategory.message}
              </p>
            )}
          </div>

          <Input
            label="Address line 1"
            leftIcon={<MapPin size={16} />}
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />

          <Input
            label="Address line 2 (optional)"
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />

          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              City
            </label>
            <select
              disabled={isLoadingCities}
              className="w-full h-11 rounded-md border border-border bg-surface-raised text-sm text-text px-3 capitalize focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              {...register("cityId")}
            >
              <option value="">
                {isLoadingCities ? "Loading cities..." : "Select a city"}
              </option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-xs text-error mt-1">{errors.cityId.message}</p>
            )}
          </div>

          <Input
            label="Postal code"
            leftIcon={<MapPinArea size={16} />}
            inputMode="numeric"
            maxLength={6}
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />

          <Input
            label="Password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="grid grid-cols-2 gap-3">
            <FileField
              label="Shop avatar"
              icon={<ImageIcon size={16} />}
              file={avatarFile}
              onChange={(e) => handleFileChange(e, setAvatarFile)}
              onRemove={() => setAvatarFile(null)}
              previewShape="circle"
            />
          </div>

          <div className="rounded-md border border-border bg-surface p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary min-w-0">
              <MapPin size={16} className="shrink-0" />
              {coords ? (
                <span className="truncate">
                  Location captured ({coords.lat.toFixed(3)},{" "}
                  {coords.lng.toFixed(3)})
                </span>
              ) : (
                <span className="truncate">
                  {geoError
                    ? "Location access denied"
                    : "Shop location required"}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isLocating}
              onClick={requestLocation}
            >
              {coords ? "Update" : "Share location"}
            </Button>
          </div>

          <Input
            label="Google Map Link"
            leftIcon={<MapPin size={16} />}
            helperText="Used for seller's google map address"
            error={errors.googleMapLink?.message}
            {...register("googleMapLink")}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Register shop
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function FileField({
  label,
  icon,
  file,
  onChange,
  onRemove,
  previewShape = "square",
}) {
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <label className="text-sm font-medium">{label}</label>

      {!file ? (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary ${
            previewShape === "circle"
              ? "h-40 w-40 rounded-full"
              : "h-36 w-full rounded-xl"
          }`}
        >
          {icon}
          <span className="mt-2 text-sm">Choose image</span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt={label}
            className={`object-cover border-2 border-gray-200 ${
              previewShape === "circle"
                ? "h-40 w-40 rounded-full"
                : "h-40 w-full rounded-xl"
            }`}
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:scale-105 hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
