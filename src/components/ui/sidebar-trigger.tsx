import React from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from './button';
import { useSidebar } from '../../context/SidebarContext';

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {}

export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}