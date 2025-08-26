import React from "react";
import { Link } from "gatsby";
import { Button } from "../ui/button";
import { Spotlight } from "../ui/spotlight";
import TextType from "../text-type/TextType";

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

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/funsaized",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sainimmagadda",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    href: "https://www.threads.com/@funsaized",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 192 192">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 150.047 120.332C151.179 124.836 150.42 129.172 147.953 133.798C144.227 140.873 137.23 145.793 127.227 148.649C116.926 151.614 104.322 152.138 92.5668 150.088C78.5955 147.506 66.8372 142.172 58.0266 134.611C49.1642 126.999 43.3777 117.296 41.1078 106.183C38.5555 93.6521 40.2636 79.6659 45.9536 67.4318C51.6124 55.2687 61.0768 45.0166 72.9565 38.2049C84.9366 31.3393 98.8173 28.2143 112.916 29.1098C123.312 29.7784 133.431 32.1778 142.803 36.2067C151.597 39.9812 159.581 45.0832 166.435 51.2937L154.501 62.5499C149.494 58.3646 143.909 54.8222 137.786 52.0174C128.685 47.899 118.576 45.6418 108.209 45.2687C106.524 45.2083 104.836 45.1889 103.152 45.2077C72.2579 45.6267 45.3797 63.2701 36.3488 89.2721C27.0748 115.971 35.2753 145.6 57.2938 161.316C67.2306 168.697 79.1125 173.849 92.1975 176.352C117.66 181.17 143.445 176.263 160.965 162.328C174.835 151.305 182.028 136.775 181.506 120.855C180.912 102.778 169.219 91.8364 141.537 88.9883ZM99.7259 130.533C88.2276 131.24 78.1725 125.255 77.6142 116.698C77.2102 110.615 80.3922 105.553 85.6981 102.13C90.3864 99.1108 96.2432 97.4873 102.756 97.1094C109.332 96.7275 116.391 97.2647 123.556 98.682C122.391 116.671 113.599 129.758 99.7259 130.533Z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com/FunSaized",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
  },
];

export function Hero() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Spotlight Effect - Only visible in dark mode */}
      <Spotlight
        className="-top-40 left-10 md:-top-20 md:left-1/3 lg:-top-32 lg:left-1/4 dark:block hidden"
        fill="white"
      />

      {/* Subtle background overlay to enhance spotlight effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-900/5 dark:to-slate-100/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main Hero Content */}
          <div className="mb-8 relative z-10">
            <TextType
              text={["Hi, I'm Sai,"]}
              as="h1"
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
              textColors={[
                "", // Use default foreground color for "Hi, I'm "
                "#ea580c", // Orange for "Sai"
                "", // Use default foreground color for " - Engineer"
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
            />

            <p className="mb-4 text-xl md:text-2xl text-muted-foreground">
              Engineer • Healthcare • AI • Lifestyle
            </p>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
              I'm a full stack software engineer focused on using tech to find
              novel solutions. I build things, contribute to open source, and
              love a good challenge. Passionate about creating technology that
              improves outcomes and enhances developer experience.
            </p>
          </div>

          {/* Social Links */}
          <div className="mb-8 flex justify-center space-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/articles">Browse Articles</Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/funsaized"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                View Projects
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>

          {/* Quick Stats */}
          {/*<div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold">74+</div>
              <div className="text-sm text-muted-foreground">
                Technical Articles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10+</div>
              <div className="text-sm text-muted-foreground">
                Open Source Projects
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-sm text-muted-foreground">
                Years Experience
              </div>
            </div>
          </div>*/}
        </div>
      </div>
    </section>
  );
}
