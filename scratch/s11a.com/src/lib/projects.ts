export interface Project {
	icon: string;
	title: string;
	path: string;
	source: string;
	description: string;
	status: "active" | "in-progress" | "archived";
	stars?: number;
	forks?: number;
}

export const projects: Project[] = [
	{
		icon: "🌳",
		title: "arbord",
		path: "https://arbord.dev",
		source: "https://github.com/funsaized/arbord",
		description:
			"Track every claude & codex session. Watch usage. Grow a forest. Shipping Fall '26",
		status: "active",
	},
	{
		icon: "🧑‍🍳",
		title: "herdr-mise",
		path: "https://github.com/funsaized/herdr-mise",
		source: "https://github.com/funsaized/herdr-mise",
		description:
			"A visualizer that renders AI coding agents as pixel-art line cooks. Run the pass, not the prompts!",
		status: "active",
		stars: 1,
		forks: 0,
	},
	{
		icon: "🐍",
		title: "PowerSnek",
		path: "https://powersnek.s11a.com",
		source: "https://github.com/funsaized/PowerSnek",
		description: "A tiny macOS menu bar app that celebrates when you plug in.",
		status: "active",
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
	},
	{
		icon: "🌅",
		title: "Eventide",
		path: "https://eventide.s11a.com",
		source: "https://github.com/funsaized/Eventide",
		description:
			"Turn Robinhood Derivatives PDF statements into actionable trading analytics — entirely in your browser. No server, no cloud, no account.",
		status: "active",
	},
	{
		icon: "📆",
		title: "OctoAgenda",
		path: "https://octoagenda.s11a.com",
		source: "https://github.com/funsaized/OctoAgenda",
		description:
			"Scrape events from any source on the web and export to iCal (.ics)",
		status: "in-progress",
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
	},
	{
		icon: "🚧",
		title: "azure-terraform-generator",
		path: "https://github.com/funsaized/azure-terraform-generator",
		source: "https://github.com/funsaized/azure-terraform-generator",
		description:
			"CLI tool to query resources and generate terraform definitions for existing objects",
		status: "active",
		stars: 2,
		forks: 1,
	},
];
