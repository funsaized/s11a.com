export type ProjectBadge = "new" | "building" | "archived";

export interface Project {
	icon: string;
	title: string;
	path: string;
	source: string;
	description: string;
	status: "active" | "in-progress" | "archived";
	year: number;
	category: string;
	badge?: ProjectBadge;
	stars?: number;
	forks?: number;
}

export const projects: Project[] = [
	{
		icon: "✏️",
		title: "stet",
		path: "https://github.com/funsaized/stet",
		source: "https://github.com/funsaized/stet",
		description:
			"Hand-sketched margin marks on live UI. Add circles, highlights, arrows, notes, and proofreader marks without replacing your controls or layout",
		status: "active",
		year: 2026,
		category: "UI library",
		badge: "building",
	},
	{
		icon: "🌳",
		title: "arbord",
		path: "https://arbord.dev",
		source: "https://github.com/funsaized/arbord",
		description:
			"Track every claude & codex session. Watch usage. Grow a forest. Shipping Fall '26",
		status: "active",
		year: 2026,
		category: "Developer tools",
		badge: "building",
	},
	{
		icon: "🧑‍🍳",
		title: "herdr-mise",
		path: "https://github.com/funsaized/herdr-mise",
		source: "https://github.com/funsaized/herdr-mise",
		description:
			"A visualizer that renders AI coding agents as pixel-art line cooks. Run the pass, not the prompts!",
		status: "active",
		year: 2026,
		category: "Developer tools",
		badge: "new",
		stars: 3,
		forks: 0,
	},
	{
		icon: "📺",
		title: "hoardarr",
		path: "https://github.com/funsaized/hoardarr",
		source: "https://github.com/funsaized/hoardarr",
		description:
			"A self-hosted movie automation workflow built on Swamp. Control your data, control your pipelines.",
		status: "active",
		year: 2026,
		category: "Homelab",
		badge: "building",
		stars: 0,
		forks: 0,
	},
	{
		icon: "🐍",
		title: "PowerSnek",
		path: "https://powersnek.s11a.com",
		source: "https://github.com/funsaized/PowerSnek",
		description: "A tiny macOS menu bar app that celebrates when you plug in.",
		status: "active",
		year: 2026,
		category: "Desktop app",
		badge: "new",
		stars: 0,
		forks: 0,
	},
	{
		icon: "💅",
		title: "lith",
		path: "https://github.com/funsaized/lith",
		source: "https://github.com/funsaized/lith",
		description:
			"A pipeline for producing style-locked image-generation prompts",
		status: "active",
		year: 2026,
		category: "Image generation",
		badge: "new",
	},
	{
		icon: "🌊",
		title: "Kanagawa Zed Theme",
		path: "https://github.com/funsaized/kanagawa-zed-theme",
		source: "https://github.com/funsaized/kanagawa-zed-theme",
		description:
			"Kanagawa Wave dark theme with blur/transparency effects for Zed.",
		status: "active",
		year: 2026,
		category: "Zed extension",
	},
	{
		icon: "🌅",
		title: "Eventide",
		path: "https://eventide.s11a.com",
		source: "https://github.com/funsaized/Eventide",
		description:
			"Turn Robinhood Derivatives PDF statements into actionable trading analytics — entirely in your browser. No server, no cloud, no account.",
		status: "archived",
		year: 2025,
		category: "Developer tools",
	},
	{
		icon: "📆",
		title: "OctoAgenda",
		path: "https://octoagenda.s11a.com",
		source: "https://github.com/funsaized/OctoAgenda",
		description:
			"Scrape events from any source on the web and export to iCal (.ics)",
		status: "archived",
		year: 2025,
		category: "Utility",
		stars: 0,
		forks: 0,
	},
	{
		icon: "☕",
		title: "Fickle Cal",
		path: "https://todo.s11a.com/home",
		source: "https://github.com/funsaized/feined-todo",
		description:
			"A local-first, calendar-centric todo app... b/c everyone has to have one of these",
		status: "active",
		year: 2025,
		category: "Desktop app",
		stars: 2,
		forks: 0,
	},
	{
		icon: "🍷",
		title: "prompts.wine",
		path: "https://prompts.wine",
		source: "https://github.com/funsaized/prompts.wine",
		description:
			"A directory of instructions, agents, and workflows for LLMs & tools that have aged like fine wine",
		status: "active",
		year: 2024,
		category: "Open source",
		stars: 0,
		forks: 0,
	},
	{
		icon: "🧄",
		title: "Garlic-bot",
		path: "https://twitter.com/garlichub",
		source: "https://github.com/funsaized/garlic-bot",
		description: "A serverless bot that RTs garlic when it feels like it",
		status: "archived",
		year: 2019,
		category: "Open source",
		stars: 1,
		forks: 0,
	},
	{
		icon: "🐙",
		title: "Stack Exchange GraphQL Server",
		path: "https://github.com/funsaized/stack-exchange-graphql-server",
		source: "https://github.com/funsaized/stack-exchange-graphql-server",
		description: "A GraphQL endpoint for Stack Exchange data powered by Go",
		status: "archived",
		year: 2020,
		category: "Open source",
		stars: 4,
		forks: 0,
	},
	{
		icon: "🐥",
		title: "FPGA-Flappy-Bird",
		path: "https://github.com/funsaized/FPGA-Flappy-Bird",
		source: "https://github.com/funsaized/FPGA-Flappy-Bird",
		description:
			"Old school project. Run custom build flappy bird on custom build processor (verilog)",
		status: "archived",
		year: 2017,
		category: "Open source",
		stars: 1,
		forks: 0,
	},
	{
		icon: "🐍",
		title: "Reactive Snakes",
		path: "https://ng-reactive-snakes.s11a.com",
		source: "https://github.com/funsaized/ng-reactive-snake",
		description:
			"The classic game of snake! Built as a reference implementation of thinking reactively with RxJS",
		status: "active",
		year: 2024,
		category: "Open source",
	},
	{
		icon: "🏥",
		title: "Parkinson's & Essential Tremor Quantification System",
		path: "https://github.com/funsaized/PD-and-ET-Tremor-Quantification",
		source: "https://github.com/funsaized/PD-and-ET-Tremor-Quantification",
		description:
			"Quantification of Parkinsonian and Essential Tremor using a novel, bluetooth-integrated accelerometer based system",
		status: "archived",
		year: 2017,
		category: "Open source",
	},
];
