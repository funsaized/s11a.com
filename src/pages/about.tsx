import React from "react";
import type { PageProps } from "gatsby";
import { Layout } from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const AboutPage: React.FC<PageProps> = () => {
  const skills = [
    {
      category: "Languages",
      items: ["Java", "JavaScript", "TypeScript", "Python", "Go", "Scala"],
    },
    {
      category: "Frontend",
      items: ["Angular", "React", "Next.js", "Gatsby", "Local-First"],
    },
    {
      category: "Backend",
      items: [
        "Spring",
        "Spring Boot",
        "Node.js",
        "GraphQL",
        "REST APIs",
        "RPC",
        "Microservices",
        "Data Engineering",
        "Data Science",
      ],
    },
    {
      category: "Cloud & DevOps",
      items: [
        "Azure",
        "AWS",
        "Kubernetes",
        "DataBricks",
        "Terraform",
        "Jenkins",
        "Github",
        "Docker",
      ],
    },
    {
      category: "Datastores",
      items: [
        "MySQL",
        "PostgreSQL",
        "CosmosDB",
        "Redis",
        "Memcached",
        "Elasticsearch",
      ],
    },
    {
      category: "Tools",
      items: ["Git", "Linux", "Bash", "Bootstrap", "Jupyter", "AI Agents"],
    },
  ];

  const currentFocus = [
    {
      title: "Data Structures & Algorithms",
      description:
        "Practicing problem-solving on LeetCode to sharpen algorithmic thinking",
      icon: "🧩",
    },
    {
      title: "Learning Golang",
      description:
        "Exploring Go for building high-performance distributed systems",
      icon: "🐹",
    },
    {
      title: "Keyboard Customization",
      description: "Working with QMK firmware for custom mechanical keyboards",
      icon: "⌨️",
    },
  ];

  return (
    <Layout
      title="About"
      description="Learn more about Sai Nimmagadda, full-stack engineer focused on healthcare and scalable systems."
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <img
                src="/images/me.jpg"
                alt="Sai Nimmagadda"
                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full mx-auto object-cover border-4 border-muted shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Me</h1>
            <p className="text-xl text-muted-foreground">
              Full-stack engineer passionate about technology, learning, and
              collaboration
            </p>
          </div>

          {/* Bio Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👋</span>
                Hello, I&apos;m Sai
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m a full-stack software engineer with a BSE in Electrical
                and Computer Engineering and Biomedical Engineering from{" "}
                <strong>Duke University</strong>. I&apos;m passionate about
                building scalable systems, exploring new technologies, and
                contributing to open-source software.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I believe the best way to learn is through collaboration with
                others. That&apos;s why I&apos;m growing this site in parallel
                with my exploration of new tech and open-source software,
                sharing knowledge and experiences along the way.
              </p>
            </CardContent>
          </Card>

          {/* Skills Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Skills & Technologies</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skillGroup) => (
                <Card key={skillGroup.category}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {skillGroup.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Focus */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Current Focus</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {currentFocus.map((focus) => (
                <Card key={focus.title} className="text-center">
                  <CardHeader>
                    <div className="text-4xl mb-2">{focus.icon}</div>
                    <CardTitle className="text-lg">{focus.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {focus.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Tools</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Software */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-xl">💻</span>
                    Software
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    This website is hosted on{" "}
                    <a
                      href="https://www.netlify.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Netlify
                    </a>{" "}
                    and uses the{" "}
                    <a
                      href="https://www.gatsbyjs.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Gatsby
                    </a>{" "}
                    SSG framework.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Coding</strong>:{" "}
                      <a
                        href="https://code.visualstudio.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visual Studio Code
                      </a>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>
                          <strong className="text-foreground">Theme</strong>:{" "}
                          <a
                            href="https://taniarascia.github.io/new-moon/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            New Moon Theme
                          </a>
                          , my custom syntax theme!
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong className="text-foreground">Terminal</strong>:{" "}
                      <a
                        href="https://iterm2.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        iTerm2
                      </a>
                    </li>
                    <li>
                      <strong className="text-foreground">Notes</strong>:{" "}
                      <a
                        href="https://obsidian.md/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Obsidian
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Hardware */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-xl">🖥️</span>
                    Hardware
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>
                      <strong className="text-foreground">Coding PC</strong>: M1
                      MacBook Pro 16&quot; 2021, 32GB RAM
                    </li>
                    <li>
                      <strong className="text-foreground">Gaming PC</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>
                          CPU:{" "}
                          <a
                            href="https://www.amd.com/en/products/cpu/amd-ryzen-5-3600"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            AMD Ryzen 5 3600
                          </a>
                        </li>
                        <li>
                          Motherboard:{" "}
                          <a
                            href="https://www.asrock.com/mb/AMD/B550%20Phantom%20Gaming%204/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            ASRock B550 Phantom Gaming 4
                          </a>
                        </li>
                        <li>
                          Memory:{" "}
                          <a
                            href="https://www.crucial.com/memory/ddr4/bl2k16g32c16u4b"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Crucial Ballistix 32GB
                          </a>
                        </li>
                        <li>
                          Storage:{" "}
                          <a
                            href="https://www.samsung.com/us/computing/memory-storage/solid-state-drives/970-evo-nvme-m-2-ssd-1tb-mz-v7e1t0bw/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            SSD 970 EVO NVMe M.2 1TB
                          </a>
                        </li>
                        <li>
                          GPU:{" "}
                          <a
                            href="https://www.amd.com/en/products/graphics/amd-radeon-rx-6950-xt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Radeon 6950XT
                          </a>
                        </li>
                        <li>
                          PSU:{" "}
                          <a
                            href="https://www.evga.com/products/product.aspx?pn=220-G5-0650-X1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            EVGA SuperNOVA 650 G+
                          </a>
                        </li>
                        <li>
                          Case:{" "}
                          <a
                            href="https://nzxt.com/product/h510-elite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            H510 Elite
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong className="text-foreground">Monitor</strong>:{" "}
                      <a
                        href="https://www.asus.com/displays-desktops/monitors/tuf-gaming/tuf-gaming-vg27aq/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        TUF Gaming VG27AQ
                      </a>{" "}
                      (x2)
                    </li>
                    <li>
                      <strong className="text-foreground">Keyboard</strong>:{" "}
                      <a
                        href="https://www.durgod.com/product/fusion-retro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Durgod Fusion
                      </a>
                    </li>
                    <li>
                      <strong className="text-foreground">Microphone</strong>:{" "}
                      <a
                        href="https://www.bluemic.com/en-us/products/yeti/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Blue Yeti
                      </a>
                    </li>
                    <li>
                      <strong className="text-foreground">Headphones</strong>:{" "}
                      <a
                        href="https://www.sony.com/en/headphones/products/wh-1000xm3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Sony WH-1000XM3
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Philosophy */}
          <Card className="mb-8 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg italic text-center">
                &quot;I believe the best way to learn is through collaboration
                with others&quot;
              </blockquote>
              <p className="text-muted-foreground mt-4 text-center">
                Sharing is caring ❤️ and drives my commitment to open-source
                contributions, knowledge sharing, and building meaningful
                connections in the tech community.
              </p>
            </CardContent>
          </Card>

          {/* Connect Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Let&apos;s Connect</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <a
                  href="https://github.com/funsaized"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://linkedin.com/in/sainimmagadda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/articles" className="inline-flex items-center gap-2">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Read My Articles
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
