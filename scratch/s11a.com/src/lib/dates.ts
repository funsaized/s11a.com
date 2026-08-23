const shortMonths = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
] as const;

const longMonths = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december",
] as const;

function parseIsoDate(isoDate: string) {
	const [year, month, day] = isoDate.split("-");

	return {
		year,
		monthIndex: Number(month) - 1,
		day: Number(day),
	};
}

export function formatShortDate(isoDate: string) {
	const { year, monthIndex } = parseIsoDate(isoDate);

	return `${shortMonths[monthIndex]} ${year}`;
}

export function formatLongDate(isoDate: string) {
	const { year, monthIndex, day } = parseIsoDate(isoDate);

	return `${longMonths[monthIndex]} ${day}, ${year}`;
}
