import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_ID;

export const initAnalytics = () => {
    if (!GA_ID || import.meta.env.DEV) return;

    ReactGA.initialize(GA_ID);
};

export const trackPageView = (path) => {
    if (!GA_ID || import.meta.env.DEV) return;

    ReactGA.send({
        hitType: "pageview",
        page: path,
    });
};