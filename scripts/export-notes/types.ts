export interface RawNote {
  id: string;
  title: string;
  body: string; // HTML string from Apple Notes
  creationDate: string; // ISO date string
  modificationDate: string; // ISO date string
  folder: string; // Apple Notes folder name
}

export interface ProcessedImage {
  filename: string; // e.g. "my-note-000.jpg"
  data: Buffer;
  format: "jpeg" | "png" | "webp";
}

export interface ProcessedNote {
  title: string;
  slug: string;
  category: string; // PascalCase, e.g. "Food"
  tags: string[]; // lowercase, from #hashtags
  date: string; // YYYY-MM-DD
  excerpt: string;
  readingTime: string; // e.g. "3 min read"
  markdown: string;
  images: ProcessedImage[];
}

export interface ExportConfig {
  notesDir: string; // e.g. "src/content/notes"
  imageDir: string; // e.g. "static/images/articles"
  excludeTags: string[]; // e.g. ["personal", "private"]
  author: string; // e.g. "Sai Nimmagadda"
  dryRun: boolean;
  verbose: boolean;
}

export interface ExportStats {
  total: number;
  archived: number;
  private: number;
  untagged: number;
  exported: number;
  images: number;
  errors: string[];
}
