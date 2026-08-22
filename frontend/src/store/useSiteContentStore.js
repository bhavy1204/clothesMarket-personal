import { create } from "zustand";
import { siteContentService } from "@/api/index";

const FAQ_CACHE_KEY = "faqsCache";
const CACHE_DURATION = 48 * 60 * 60 * 1000;

const useSiteContentStore = create((set, get) => ({
  faqs: [],
  faqsLoading: false,

  loadFAQs: async () => {
    const { faqs } = get();

    if (faqs.length > 0) {
      return faqs;
    }

    const cached = localStorage.getItem(FAQ_CACHE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        const isFresh = Date.now() - parsed.timestamp < CACHE_DURATION;

        if (isFresh && Array.isArray(parsed.faqs)) {
          set({
            faqs: parsed.faqs,
          });

          return parsed.faqs;
        }
      } catch {
        localStorage.removeItem(FAQ_CACHE_KEY);
      }
    }

    set({ faqsLoading: true });

    try {
      const res = await siteContentService.getAllFAQs();

      const fetchedFAQs = res.data?.data ?? [];

      localStorage.setItem(
        FAQ_CACHE_KEY,
        JSON.stringify({
          faqs: fetchedFAQs,
          timestamp: Date.now(),
        })
      );

      set({
        faqs: fetchedFAQs,
        faqsLoading: false,
      });

      return fetchedFAQs;
    } catch (error) {
      set({ faqsLoading: false });
      throw error;
    }
  },

  clearFAQCache: () => {
    localStorage.removeItem(FAQ_CACHE_KEY);
    set({ faqs: [] });
  },
}));

export default useSiteContentStore;
