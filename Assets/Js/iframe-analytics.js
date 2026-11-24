(() => {
    const iframeSelector = "iframe.cx-analytics-iframe";

    function trackIframe(frame) {
        const eventData = {
            event_category: "engagement",
            iframe_title: frame.title || "",
            iframe_src: frame.src
        };

        if (typeof window.gtag === "function") {
            window.gtag("event", "iframe_click", eventData);
        } else if (window.dataLayer && typeof window.dataLayer.push === "function") {
            window.dataLayer.push({ event: "iframe_click", ...eventData });
        }

        window.dispatchEvent(new CustomEvent("cinelux:iframe_click", { detail: eventData }));
    }

    document.querySelectorAll(iframeSelector).forEach(frame => {
        frame.addEventListener("focus", () => trackIframe(frame));
    });
})();
