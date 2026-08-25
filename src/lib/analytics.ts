const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// HMR gate
let bound = false;

// Google's snippet uses `arguments`, not a rest array. gtag.js treats them differently.
function pushGtagArgs() {
	window.dataLayer!.push(arguments as unknown as never);
}

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

	window.dataLayer ??= [];
	window.gtag = pushGtagArgs;
	window.gtag("js", new Date());
	window.gtag("config", measurementId);

	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
	document.head.appendChild(script);

	let last = router.state.location.href;
	router.subscribe("onResolved", () => {
		const path = router.state.location.href;
		if (path === last) return;
		last = path;
		window.gtag?.("config", measurementId, { page_path: path });
	});
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
