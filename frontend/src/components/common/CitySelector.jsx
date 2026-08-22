import { useEffect } from "react";
import { MapPin } from "@phosphor-icons/react";
import { adminService } from "@/api/index";
import useCityStore from "@/store/useCityStore";

export default function CitySelector({ className = "", label }) {
  const selectedCity = useCityStore((s) => s.selectedCity);
  const cities = useCityStore((s) => s.cities);
  const citiesLoading = useCityStore((s) => s.citiesLoading);

  const setSelectedCity = useCityStore((s) => s.setSelectedCity);
  const loadSelectedCity = useCityStore((s) => s.loadSelectedCity);
  const loadCities = useCityStore((s) => s.loadCities);

  useEffect(() => {
    loadSelectedCity();

    loadCities(async () => {
      const res = await adminService.getAllActiveCities();
      return res.data?.data ?? [];
    }).then((activeCities) => {
      if (activeCities.length === 0) return;

      const stored = useCityStore.getState().selectedCity;

      const matched = stored
        ? activeCities.find((city) => city._id === stored._id)
        : null;

      const defaultCity =
        activeCities.find(
          (city) => city.name.toLowerCase() === "udaipur"
        ) ?? activeCities[0];

      setSelectedCity(matched ?? defaultCity);
    }).catch(() => {
      // Keep cached/previous state if API fails
    });
  }, [loadSelectedCity, loadCities, setSelectedCity]);

  const handleChange = (e) => {
    const city = cities.find((c) => c._id === e.target.value);

    if (city) {
      setSelectedCity(city);
    }
  };

  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}

      <div
        className={[
          "flex h-10 overflow-hidden rounded-lg border border-border bg-surface-raised transition-colors sm:h-11",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        ].join(" ")}
      >
        <div className="flex w-10 shrink-0 items-center justify-center border-r border-border text-text-muted sm:w-11">
          <MapPin size={16} className="sm:hidden" />
          <MapPin size={18} className="hidden sm:block" />
        </div>

        <select
          value={selectedCity?._id ?? ""}
          onChange={handleChange}
          disabled={citiesLoading || cities.length === 0}
          aria-label={label || "Select city"}
          className={[
            "flex-1 bg-transparent px-2.5 text-xs capitalize text-text outline-none sm:px-3 sm:text-sm",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {citiesLoading ? (
            <option value="">Loading cities...</option>
          ) : cities.length === 0 ? (
            <option value="">No cities available</option>
          ) : (
            cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
