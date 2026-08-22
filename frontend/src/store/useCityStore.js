import { create } from "zustand";

const SELECTED_CITY_KEY = "selectedCity";
const CITIES_CACHE_KEY = "citiesCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const useCityStore = create((set, get) => ({
    selectedCity: null,
    cities: [],
    citiesLoading: false,

    setSelectedCity: (city) => {
        set({ selectedCity: city });

        if (city) {
            localStorage.setItem(
                SELECTED_CITY_KEY,
                JSON.stringify(city)
            );
        } else {
            localStorage.removeItem(SELECTED_CITY_KEY);
        }
    },

    loadSelectedCity: () => {
        const stored = localStorage.getItem(SELECTED_CITY_KEY);

        if (!stored) return;

        try {
            set({
                selectedCity: JSON.parse(stored),
            });
        } catch {
            localStorage.removeItem(SELECTED_CITY_KEY);
        }
    },

    loadCities: async (fetchCities) => {
        const { cities } = get();

        // Already loaded in this app session
        if (cities.length > 0) {
            return cities;
        }

        // Check localStorage cache
        const cached = localStorage.getItem(CITIES_CACHE_KEY);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);

                const isFresh =
                    Date.now() - parsed.timestamp < CACHE_DURATION;

                if (isFresh && Array.isArray(parsed.cities)) {
                    set({
                        cities: parsed.cities,
                    });

                    return parsed.cities;
                }
            } catch {
                localStorage.removeItem(CITIES_CACHE_KEY);
            }
        }

        // Cache missing/expired → API call
        set({ citiesLoading: true });

        try {
            const newCities = await fetchCities();

            localStorage.setItem(
                CITIES_CACHE_KEY,
                JSON.stringify({
                    cities: newCities,
                    timestamp: Date.now(),
                })
            );

            set({
                cities: newCities,
                citiesLoading: false,
            });

            return newCities;
        } catch (error) {
            set({ citiesLoading: false });
            throw error;
        }
    },

    clearSelectedCity: () => {
        localStorage.removeItem(SELECTED_CITY_KEY);
        set({ selectedCity: null });
    },

    clearCitiesCache: () => {
        localStorage.removeItem(CITIES_CACHE_KEY);

        set({
            cities: [],
        });
    },
}));

export default useCityStore;

