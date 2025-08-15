import * as React from "react"
import { Link } from "gatsby"
import {
  Github,
  MessageCircle,
  Rss,
  StickyNote,
  Briefcase,
  ChefHat,
  Dumbbell,
  Plane,
  Music,
} from "lucide-react"

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
} from "../ui/sidebar"
import SearchTrigger from "../SearchTrigger/SearchTrigger"
import SearchDialog from "../SearchDialog/SearchDialog"

// Sample data structure
const data = {
  about: {
    title: "About Me",
    description: "I'm Sai, software engineer and open-source creator. Software is my hobby 🎮",
    emoji: "🎮"
  },
  navMain: [
    {
      title: "Stay Connected",
      items: [
        {
          title: "GitHub",
          url: "https://github.com/funsaized",
          icon: Github,
          isExternal: true,
        },
        {
          title: "Threads", 
          url: "https://www.threads.com/@funsaized",
          icon: MessageCircle,
          isExternal: true,
        },
        {
          title: "RSS Feed",
          url: "/rss.xml",
          icon: Rss,
          isExternal: false,
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
          isExternal: false,
        },
      ],
    },
    {
      title: "Lifestyle (coming soon...)",
      items: [
        {
          title: "Productivity & Workflows",
          url: "/lifestyle/productivity",
          icon: Briefcase,
          isExternal: false,
        },
        {
          title: "Cooking Experiments",
          url: "/lifestyle/cooking", 
          icon: ChefHat,
          isExternal: false,
        },
        {
          title: "Fitness Journey",
          url: "/lifestyle/fitness",
          icon: Dumbbell,
          isExternal: false,
        },
        {
          title: "Travel Adventures",
          url: "/lifestyle/travel",
          icon: Plane,
          isExternal: false,
        },
        {
          title: "Music & Playlists",
          url: "/lifestyle/music",
          icon: Music,
          isExternal: false,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = React.useState(false)

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
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
                        {item.isExternal ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        ) : (
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        )}
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
  )
}

export default AppSidebar