import type { ReactNode } from "react";

interface ProseProps {
	children: ReactNode;
}

export function Prose({ children }: ProseProps) {
	return (
		<div className="max-w-prose">
			<div className="prose max-w-none prose-pre:overflow-x-auto prose-img:rounded-media">
				{children}
			</div>
		</div>
	);
}
