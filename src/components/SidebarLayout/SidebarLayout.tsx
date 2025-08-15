import React from "react";
import GlobalSidebar from "../GlobalSidebar/GlobalSidebar";
import { useSidebar } from "../../context/SidebarContext";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

function SidebarLayout({ children }: SidebarLayoutProps): React.ReactElement {
  const { isOpen } = useSidebar();

  return (
    <>
      <GlobalSidebar />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}

export default SidebarLayout;