import { cn } from "#/lib/utils.ts";

type CoffeeCupVariant = "outline" | "filled";

interface CoffeeCupProps {
	className?: string;
	variant?: CoffeeCupVariant;
}

export function CoffeeCup({ className, variant = "outline" }: CoffeeCupProps) {
	const isFilled = variant === "filled";

	return (
		<span
			aria-hidden="true"
			className={cn("coffee-mark", isFilled && "coffee-mark-filled", className)}
		>
			<span className="coffee-steam coffee-steam-left" />
			{!isFilled && <span className="coffee-steam coffee-steam-middle" />}
			<span className="coffee-steam coffee-steam-right" />
			<span className="coffee-cup">
				{isFilled && <span className="coffee-fill" />}
			</span>
			<span className="coffee-handle" />
			<span className="coffee-saucer" />
		</span>
	);
}
