import * as React from "react";
import { Link } from "gatsby";
import {
  Github,
  MessageCircle,
  Rss,
  StickyNote,
  // Briefcase,
  ChefHat,
  Dumbbell,
  Plane,
  Music,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "../ui/sidebar";
import SearchTrigger from "../SearchTrigger/SearchTrigger";
import SearchDialog from "../SearchDialog/SearchDialog";

// Sample data structure
const data = {
  about: {
    title: "About Me",
    description:
      "I'm Sai, software engineer and open-source creator. Software is my hobby 🎮",
    emoji: "🎮",
  },
  navMain: [
    {
      title: "Stay Connected",
      items: [
        {
          title: "GitHub",
          url: "https://github.com/funsaized",
          icon: Github,
        },
        {
          title: "Threads",
          url: "https://www.threads.com/@funsaized",
          icon: MessageCircle,
        },
        {
          title: "RSS Feed",
          url: "/rss.xml",
          icon: Rss,
        },
      ],
    },
    {
      title: "Notes (coming soon...)",
      items: [
        {
          title: "Notes",
          url: "/notes",
          icon: StickyNote,
        },
      ],
    },
    {
      title: "Lifestyle (coming soon...)",
      items: [
        {
          title: "Fitness",
          url: "/lifestyle/fitness",
          icon: Dumbbell,
        },
        // {
        //   title: "Productivity & Workflows",
        //   url: "/lifestyle/productivity",
        //   icon: Briefcase,
        // },
        {
          title: "Cooking, Grocery, etc",
          url: "/lifestyle/cooking",
          icon: ChefHat,
        },

        {
          title: "Travel Adventures",
          url: "/lifestyle/travel",
          icon: Plane,
        },
        {
          title: "Music & Playlists",
          url: "/lifestyle/music",
          icon: Music,
        },
      ],
    },
  ],
};

function AppSidebar() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupContent>
              <SearchTrigger
                onClick={() => setSearchOpen(true)}
                variant="outline"
                className="w-full justify-start"
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          {/* About Me Section */}
          <SidebarGroup>
            <SidebarGroupLabel>{data.about.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-1">
                <p className="text-xs text-muted-foreground leading-relaxed group-data-[collapsible=icon]:hidden">
                  {data.about.description}
                </p>
                <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center text-lg">
                  {data.about.emoji}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Navigation Sections */}
          {data.navMain.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default AppSidebar;
