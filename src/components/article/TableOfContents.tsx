import React from 'react';

interface TocItem {
  url: string;
  title: string;
  items?: TocItem[];
}

interface TableOfContentsProps {
  items?: TocItem[];
  className?: string;
}

const ListIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

function TocList({ items, level = 0 }: { items: TocItem[]; level?: number }) {
  return (
    <ul className={`space-y-2 ${level > 0 ? 'ml-4 mt-2' : ''}`}>
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.url}
            onClick={(e) => {
              e.preventDefault();
              const targetId = item.url.replace('#', '');
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className={`block text-sm transition-colors hover:text-primary cursor-pointer ${
              level === 0 
                ? 'font-medium text-foreground' 
                : level === 1
                ? 'text-muted-foreground'
                : 'text-muted-foreground/80'
            }`}
          >
            {item.title}
          </a>
          {item.items && item.items.length > 0 && (
            <TocList items={item.items} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ items, className = "" }: TableOfContentsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        <ListIcon />
        Table of Contents
      </div>
      
      <div className="border-l-2 border-muted pl-4">
        <TocList items={items} />
      </div>
    </nav>
  );
}