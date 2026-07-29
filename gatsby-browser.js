// Remove service workers left behind by the retired gatsby-plugin-offline.
exports.onClientEntry = () => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations.map((registration) => registration.unregister()),
        ),
      )
      .catch((error) => {
        console.warn("Unable to unregister legacy service worker:", error);
      });
  });
};
