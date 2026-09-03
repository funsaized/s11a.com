import { useEffect, useState, useSyncExternalStore } from "react";

interface TextTypeProps {
	text: string;
	typingSpeed?: number;
	cursorCharacter?: string;
}

function subscribeToReducedMotion(callback: () => void) {
	const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	mediaQuery.addEventListener("change", callback);
	return () => mediaQuery.removeEventListener("change", callback);
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TextType({
	text,
	typingSpeed = 40,
	cursorCharacter = "|",
}: TextTypeProps) {
	const [displayedText, setDisplayedText] = useState("");
	const [index, setIndex] = useState(0);
	const reducedMotion = useSyncExternalStore(
		subscribeToReducedMotion,
		prefersReducedMotion,
		() => false,
	);

	useEffect(() => {
		if (reducedMotion) return undefined;

		if (index >= text.length) return undefined;

		const timeout = setTimeout(() => {
			setDisplayedText(text.slice(0, index + 1));
			setIndex((current) => current + 1);
		}, typingSpeed);

		return () => clearTimeout(timeout);
	}, [index, reducedMotion, text, typingSpeed]);

	return (
		<span className="inline-block whitespace-pre-wrap tracking-tight">
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">
				{reducedMotion ? text : displayedText}
				<span className="text-type-caret" data-caret={cursorCharacter} />
			</span>
		</span>
	);
}
