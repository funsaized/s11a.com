import React from "react";
import GitHubButton from "../GitHubButton/GitHubButton";
import { Project } from "../../models";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";

interface ProjectListingProps {
  projects: Project[];
}

function ProjectListing({ projects }: ProjectListingProps): React.ReactElement {
  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 lg:grid-cols-2">
      {projects.map((project) => (
        <Card key={project.title}>
          <CardHeader>
            <CardTitle className="text-xl">
              <a
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                href={project.path}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-2xl">{project.icon}</span>
                <span>{project.title}</span>
              </a>
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex gap-3">
              <GitHubButton
                href={project.source}
                data-size="large"
                data-show-count="true"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-4 py-2 rounded-md border border-input"
              >
                Source
              </GitHubButton>
              {project.path && (
                <a
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md font-medium"
                  href={project.path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default ProjectListing;
