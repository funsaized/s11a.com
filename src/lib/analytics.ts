const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// HMR gate
let bound = false;

function prefersNoTrack() {
	if (navigator.globalPrivacyControl) return true;

	const dnt = navigator.doNotTrack ?? window.doNotTrack;
	return dnt === "1" || dnt === "yes";
}

export function bindAnalytics(router: {
	subscribe: (event: "onResolved", cb: () => void) => () => void;
	state: { location: { href: string } };
}) {
	if (
		bound ||
		!measurementId ||
		typeof document === "undefined" ||
		prefersNoTrack()
	) {
		return;
	}

	bound = true;

	// Same as google snippet without <script> tag
	window.dataLayer ??= [];
	window.gtag ??= (...args: unknown[]) => {
		window.dataLayer?.push(args);
	};
	window.gtag("js", new Date());
	window.gtag("config", measurementId, { send_page_view: false });

	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
	document.head.appendChild(script);

	let last = "";
	const pageview = () => {
		const path = router.state.location.href;
		if (path === last) return;
		last = path;
		window.gtag?.("event", "page_view", {
			page_location: window.location.href,
			page_path: path,
		});
	};

	pageview();
	router.subscribe("onResolved", pageview);
}

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		doNotTrack?: string;
	}

	interface Navigator {
		globalPrivacyControl?: boolean;
	}
}
