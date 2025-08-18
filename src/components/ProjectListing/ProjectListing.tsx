import React from "react";
import { ExternalLink, Github } from "lucide-react";
import { Project } from "../../models";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface ProjectListingProps {
  projects: Project[];
}

function ProjectListing({ projects }: ProjectListingProps): React.ReactElement {
  return (
    <section className="projects">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.title} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex-none">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label="Project icon">
                  {project.icon}
                </span>
                <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1">
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </CardDescription>
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex-none pt-4">
              <div className="flex gap-2 w-full">
                <Button asChild size="sm" className="flex-1">
                  <a
                    href={project.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Source
                  </a>
                </Button>
                
                {project.path && project.path !== project.source && (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a
                      href={project.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </a>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default ProjectListing;
