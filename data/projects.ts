import { Project } from "../src/models";

const projects: Project[] = [
  {
    icon: "🐶",
    title: "Project SafeStream",
    path: "https://safekids.s11a.com",
    source: "https://safekids.s11a.com",
    description:
      "Shipping soon..  Community curation meets intelligent moderation in an app that works everywhere.",
    technologies: ["React", "TypeScript", "Node.js", "Machine Learning"],
  },
  {
    icon: "📆",
    title: "OctoAgenda",
    path: "https://octoagenda.s11a.com",
    source: "https://github.com/funsaized/OctoAgenda",
    description: "Scrape events from any source on the web and export to iCal (.ics)",
    technologies: ["Node.js", "Web Scraping", "iCal", "JavaScript"],
  },
  {
    icon: "☕",
    title: "Fickle Cal",
    path: "https://todo.s11a.com/home",
    source: "https://github.com/funsaized/feined-todo",
    description:
      "A local-first, calendar-centric todo app... b/c everyone has to have one of these",
    technologies: ["React", "TypeScript", "Local Storage", "PWA"],
  },
  {
    icon: "🧄",
    title: "Garlic-bot",
    path: "https://twitter.com/garlichub",
    source: "https://github.com/funsaized/garlic-bot",
    description: "A serverless bot that RTs garlic when it feels like it",
    technologies: ["Python", "Twitter API", "Serverless", "AWS Lambda"],
  },
  {
    icon: "🐙",
    title: "Stack Exchange GraphQL Server",
    path: "https://github.com/funsaized/stack-exchange-graphql-server",
    source: "https://github.com/funsaized/stack-exchange-graphql-server",
    description: "A GraphQL endpoint for Stack Exchange data powered by Go",
    technologies: ["Go", "GraphQL", "REST API", "Stack Exchange API"],
  },
  {
    icon: "🐥",
    title: "FPGA-Flappy-Bird",
    path: "https://github.com/funsaized/FPGA-Flappy-Bird",
    source: "https://github.com/funsaized/FPGA-Flappy-Bird",
    description:
      "Old school project. Run custom build flappy bird on custom build processor (verilog)",
    technologies: ["Verilog", "FPGA", "Hardware Design", "Game Development"],
  },
  {
    icon: "🐍",
    title: "Reactive Snakes",
    path: "https://ng-reactive-snakes.s11a.com",
    source: "https://github.com/funsaized/ng-reactive-snake",
    description: "The classic game of snake! Built as a reference implementation of thinking reactively with RxJS",
    technologies: ["Angular", "TypeScript", "RxJS", "Game Development"],
  },
  {
    icon: "🚧",
    title: "azure-terraform-generator",
    path: "https://github.com/funsaized/azure-terraform-generator",
    source: "https://github.com/funsaized/azure-terraform-generator",
    description:
      "CLI tool to query resources and generate terraform definitions for existing objects",
    technologies: ["Go", "Terraform", "Azure", "CLI", "Infrastructure as Code"],
  },
];

export default projects;
