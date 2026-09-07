import { marked } from "marked";
import DOMPurify from "dompurify";

export interface Rambling {
  slug: string;
  title: string;
  date: string; // raw ISO-ish string from frontmatter, e.g. "2026-09-07"
  html: string; // sanitized HTML for the body
}

// All essays are Markdown files in ../ramblings, bundled at build time.
// Drop a new .md file in that folder and it shows up here automatically.
const files = import.meta.glob("../ramblings/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Only bold, italics, links, paragraphs, and line breaks are allowed through.
// Anything else (headings included) is stripped on render.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

function slugFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

// Minimal frontmatter parser: a leading --- block of key: value lines,
// then the body. Kept in-house to avoid a Node-oriented dependency in the
// browser bundle.
function parse(raw: string): { title: string; date: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let body = raw;

  if (match) {
    body = match[2];
    for (const line of match[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      meta[key] = value;
    }
  }

  return { title: meta.title ?? "untitled", date: meta.date ?? "", body: body.trim() };
}

function render(body: string): string {
  const rawHtml = marked.parse(body, { breaks: true, gfm: true, async: false }) as string;
  return DOMPurify.sanitize(rawHtml, SANITIZE_CONFIG);
}

// Built once at module load. Newest first by date.
const ramblings: Rambling[] = Object.entries(files)
  .map(([path, raw]) => {
    const { title, date, body } = parse(raw);
    return { slug: slugFromPath(path), title, date, html: render(body) };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getRamblings(): Rambling[] {
  return ramblings;
}

export function getRambling(slug: string): Rambling | undefined {
  return ramblings.find((r) => r.slug === slug);
}
