import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { projects } from "../../data/sampleData";
import type { Project } from "../../data/sampleData";

const GitHubIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const StarIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ForkIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 18.178l-5.53-3.189v-6.36L12 5.459l5.53 3.17v6.36L12 18.178zM12 3l-7 4.021v9.958L12 21l7-4.021V7.021L12 3z" />
  </svg>
);

function getStatusColor(status: Project["status"]) {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "in-progress":
      return "bg-yellow-500";
    case "archived":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusText(status: Project["status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "in-progress":
      return "In Progress";
    case "archived":
      return "Archived";
    default:
      return "Unknown";
  }
}

function ProjectCard({ project }: { project: Project }) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    window.open(project.path, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(project.status)}`}
                />
                <span className="text-xs text-muted-foreground">
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>
          </div>

          {/* GitHub Stats - Top Right */}
          {(project.stars !== undefined || project.forks !== undefined) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {project.stars !== undefined && (
                <div className="flex items-center gap-1">
                  <StarIcon />
                  <span>{project.stars}</span>
                </div>
              )}
              {project.forks !== undefined && (
                <div className="flex items-center gap-1">
                  <ForkIcon />
                  <span>{project.forks}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a
              href={project.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2"
            >
              <GitHubIcon />
              Source
            </a>
          </Button>

          <Button variant="outline" size="sm" asChild className="flex-1">
            <a
              href={project.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2"
            >
              <ExternalLinkIcon />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Projects() {
  return (
    <section className="py-12 md:py-18">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Featured Projects
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Open source projects spanning distributed systems, developer
              tools, hardware programming, and modern web applications.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>

          {/* GitHub Profile Link */}
          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <a
                href="https://github.com/snimmagadda1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <GitHubIcon />
                View All Projects
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
