import React from "react";
import { Link } from "gatsby";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { categoryIcons } from "../../data/sampleData";

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ArrowRightIcon = () => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

interface Note {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  date: string;
  category?: string;
  tags?: string[];
  readingTime?: string;
  contentType?: string;
}

interface NoteCardsProps {
  notes: Note[];
}

function NoteCard({ note }: { note: Note }) {
  const categoryIcon = note.category
    ? categoryIcons[note.category] || "📝"
    : "📝";

  return (
    <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{categoryIcon}</span>
            {note.category && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {note.category}
              </Badge>
            )}
          </div>
          {note.readingTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClockIcon />
              <span>{note.readingTime}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          <Link to={`/notes/${note.slug}`} className="block">
            {note.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {note.excerpt && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {note.excerpt}
          </p>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <time className="text-xs text-muted-foreground">
            {new Date(note.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>

          <Link
            to={`/notes/${note.slug}`}
            className="inline-flex items-center gap-0.5 text-xs text-primary hover:gap-1 transition-all"
          >
            Read
            <ArrowRightIcon />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoteCards({ notes }: NoteCardsProps) {
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-3xl font-bold">Notes</h2>
        <Link
          to="/notes"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          See All
        </Link>
      </div>

      <p className="text-muted-foreground mb-8">
        Quick thoughts and discoveries.
      </p>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {notes.slice(0, 4).map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
