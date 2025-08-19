export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  featured?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  github: string;
  demo?: string;
  technologies: string[];
  featured?: boolean;
  status: "active" | "archived" | "in-progress";
  stars?: number;
  forks?: number;
}

export const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Building Scalable Healthcare APIs with Node.js",
    slug: "scalable-healthcare-apis-nodejs",
    excerpt:
      "Learn how to design and implement robust healthcare APIs that can handle millions of patient records while maintaining HIPAA compliance.",
    date: "2024-08-10",
    category: "Backend",
    tags: ["Node.js", "Healthcare", "API", "HIPAA"],
    readingTime: "8 min read",
    featured: true,
  },
  {
    id: "2",
    title: "React Performance Optimization in Healthcare UIs",
    slug: "react-performance-healthcare-ui",
    excerpt:
      "Optimize React applications for healthcare environments where every millisecond counts in critical patient care situations.",
    date: "2024-08-05",
    category: "Frontend",
    tags: ["React", "Performance", "Healthcare", "UX"],
    readingTime: "6 min read",
    featured: true,
  },
  {
    id: "3",
    title: "Implementing FHIR Standards with TypeScript",
    slug: "fhir-standards-typescript",
    excerpt:
      "A comprehensive guide to implementing FHIR (Fast Healthcare Interoperability Resources) standards using TypeScript.",
    date: "2024-07-28",
    category: "Healthcare",
    tags: ["TypeScript", "FHIR", "Healthcare", "Standards"],
    readingTime: "12 min read",
    featured: true,
  },
  {
    id: "4",
    title: "Microservices Architecture for Medical Devices",
    slug: "microservices-medical-devices",
    excerpt:
      "Design patterns and best practices for building microservices that interact with medical devices and IoT sensors.",
    date: "2024-07-15",
    category: "Architecture",
    tags: ["Microservices", "IoT", "Medical Devices", "Architecture"],
    readingTime: "10 min read",
  },
  {
    id: "5",
    title: "Secure Authentication in Healthcare Applications",
    slug: "secure-authentication-healthcare",
    excerpt:
      "Implementing robust authentication and authorization patterns for healthcare applications with multi-factor authentication and role-based access.",
    date: "2024-07-01",
    category: "Security",
    tags: ["Authentication", "Security", "Healthcare", "OAuth", "MFA"],
    readingTime: "9 min read",
  },
  {
    id: "6",
    title: "Docker Containerization for Healthcare Services",
    slug: "docker-healthcare-services",
    excerpt:
      "Best practices for containerizing healthcare applications with Docker while maintaining compliance and security standards.",
    date: "2024-06-20",
    category: "DevOps",
    tags: ["Docker", "Containers", "Healthcare", "DevOps", "Security"],
    readingTime: "7 min read",
  },
  {
    id: "7",
    title: "Building Real-time Patient Monitoring Dashboards",
    slug: "realtime-patient-monitoring",
    excerpt:
      "Create responsive, real-time dashboards for patient monitoring using WebSockets, React, and modern charting libraries.",
    date: "2024-06-10",
    category: "Frontend",
    tags: ["React", "WebSockets", "Real-time", "Healthcare", "Dashboard"],
    readingTime: "11 min read",
  },
  {
    id: "8",
    title: "Database Design for Electronic Health Records",
    slug: "database-design-ehr",
    excerpt:
      "Designing efficient and secure database schemas for Electronic Health Record systems with PostgreSQL and proper indexing strategies.",
    date: "2024-05-25",
    category: "Database",
    tags: ["PostgreSQL", "Database", "EHR", "Healthcare", "Performance"],
    readingTime: "14 min read",
  },
  {
    id: "9",
    title: "Cloud Infrastructure for Healthcare Startups",
    slug: "cloud-infrastructure-healthcare-startups",
    excerpt:
      "Setting up scalable and compliant cloud infrastructure for healthcare startups using AWS with proper security and monitoring.",
    date: "2024-05-15",
    category: "Cloud",
    tags: ["AWS", "Cloud", "Healthcare", "Infrastructure", "Compliance"],
    readingTime: "13 min read",
  },
  {
    id: "10",
    title: "Testing Strategies for Medical Software",
    slug: "testing-strategies-medical-software",
    excerpt:
      "Comprehensive testing approaches for medical software including unit testing, integration testing, and regulatory compliance validation.",
    date: "2024-05-01",
    category: "Backend",
    tags: ["Testing", "Medical Software", "Quality", "Compliance", "CI/CD"],
    readingTime: "10 min read",
  },
  {
    id: "11",
    title: "GraphQL APIs for Healthcare Data Integration",
    slug: "graphql-healthcare-data-integration",
    excerpt:
      "Leveraging GraphQL to create flexible and efficient APIs for healthcare data integration across multiple systems and providers.",
    date: "2024-04-18",
    category: "Backend",
    tags: ["GraphQL", "API", "Healthcare", "Integration", "Data"],
    readingTime: "9 min read",
  },
  {
    id: "12",
    title: "Accessibility in Healthcare Web Applications",
    slug: "accessibility-healthcare-web-apps",
    excerpt:
      "Ensuring healthcare web applications are accessible to all users including those with disabilities, following WCAG guidelines.",
    date: "2024-04-05",
    category: "Frontend",
    tags: ["Accessibility", "WCAG", "Healthcare", "UX", "Inclusive Design"],
    readingTime: "8 min read",
  },
];

export const sampleProjects: Project[] = [
  {
    id: "1",
    title: "SafeStream",
    description:
      "A distributed stream processing platform built with Go, designed for reliable real-time data processing with fault tolerance and horizontal scaling.",
    icon: "🌊",
    github: "https://github.com/snimmagadda1/safestream",
    technologies: ["Go", "Distributed Systems", "Stream Processing", "Docker"],
    featured: true,
    status: "active",
    stars: 12,
    forks: 3,
  },
  {
    id: "2",
    title: "OctoAgenda",
    description:
      "GitHub workflow automation tool that streamlines project management by automatically creating calendar events from GitHub issues and milestones.",
    icon: "🐙",
    github: "https://github.com/snimmagadda1/octoagenda",
    technologies: ["Node.js", "GitHub API", "Calendar API", "JavaScript"],
    featured: true,
    status: "active",
    stars: 8,
    forks: 2,
  },
  {
    id: "3",
    title: "Fickle Cal",
    description:
      "A flexible calendar application with intelligent scheduling features and cross-platform synchronization capabilities.",
    icon: "📅",
    github: "https://github.com/snimmagadda1/fickle-cal",
    technologies: ["React", "TypeScript", "Calendar API", "Web Components"],
    featured: true,
    status: "archived",
    stars: 5,
    forks: 1,
  },
  {
    id: "4",
    title: "Garlic-bot",
    description:
      "An intelligent Discord bot with moderation capabilities, custom commands, and integration with various APIs for enhanced server management.",
    icon: "🧄",
    github: "https://github.com/snimmagadda1/garlic-bot",
    technologies: ["Python", "Discord.py", "SQLite", "API Integration"],
    featured: false,
    status: "archived",
    stars: 15,
    forks: 4,
  },
  {
    id: "5",
    title: "Stack Exchange GraphQL Server",
    description:
      "A GraphQL wrapper for the Stack Exchange API, providing a modern, type-safe interface for querying Stack Overflow and related sites.",
    icon: "📊",
    github: "https://github.com/snimmagadda1/stack-exchange-graphql-server",
    technologies: ["GraphQL", "Node.js", "TypeScript", "Stack Exchange API"],
    featured: false,
    status: "active",
    stars: 7,
    forks: 2,
  },
  {
    id: "6",
    title: "FPGA-Flappy-Bird",
    description:
      "Hardware implementation of the popular Flappy Bird game on FPGA using Verilog, complete with VGA output and user input handling.",
    icon: "🐦",
    github: "https://github.com/snimmagadda1/FPGA-Flappy-Bird",
    technologies: ["Verilog", "FPGA", "Hardware Design", "VGA"],
    featured: false,
    status: "archived",
    stars: 23,
    forks: 6,
  },
  {
    id: "7",
    title: "Reactive Snakes",
    description:
      "A modern take on the classic Snake game built with reactive programming principles using RxJS and Canvas API for smooth gameplay.",
    icon: "🐍",
    github: "https://github.com/snimmagadda1/reactive-snakes",
    technologies: ["RxJS", "JavaScript", "Canvas API", "Reactive Programming"],
    featured: false,
    status: "archived",
    stars: 11,
    forks: 3,
  },
  {
    id: "8",
    title: "azure-terraform-generator",
    description:
      "Infrastructure as Code generator for Azure resources using Terraform, with templates and best practices for common cloud architectures.",
    icon: "☁️",
    github: "https://github.com/snimmagadda1/azure-terraform-generator",
    technologies: ["Terraform", "Azure", "Infrastructure as Code", "Go"],
    featured: false,
    status: "active",
    stars: 9,
    forks: 2,
  },
];

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  Backend: "🔧",
  Frontend: "🎨",
  Healthcare: "🏥",
  Architecture: "🏗️",
  DevOps: "⚙️",
  Database: "💾",
  Cloud: "☁️",
  Security: "🔒",
};
