import { useEffect, useState } from "react";

interface TextTypeProps {
	text: string;
	typingSpeed?: number;
	cursorCharacter?: string;
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

	useEffect(() => {
		if (prefersReducedMotion()) {
			setDisplayedText(text);
			return undefined;
		}

		if (index >= text.length) return undefined;

		const timeout = setTimeout(() => {
			setDisplayedText(text.slice(0, index + 1));
			setIndex((current) => current + 1);
		}, typingSpeed);

		return () => clearTimeout(timeout);
	}, [index, text, typingSpeed]);

	return (
		<span
			className="inline-block whitespace-pre-wrap tracking-tight"
			aria-label={text}
		>
			<span className="inline">
				{displayedText}
				<span
					aria-hidden="true"
					className="text-type-caret"
					data-caret={cursorCharacter}
				/>
			</span>
		</span>
	);
}
