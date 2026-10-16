import { getCollection } from 'astro:content';
import { statSync } from 'node:fs';
import path from 'node:path';
import { categories, type Category, type CategoryId } from '../data/categories';

/** Cloudflare serves static files of up to 25 MiB. */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export interface DocumentItem {
  id: string;
  title: string;
  category: CategoryId;
  date: Date;
  description?: string;
  href: string;
  external: boolean;
  /** Upper-case file extension, e.g. "PDF". */
  type: string;
  /** Size in bytes; unknown for external links. */
  size?: number;
}

export type DocumentGroup = Category & {
  documents: DocumentItem[];
};

/** All documents, newest first. Fails the build if an uploaded file is missing or too large. */
export async function getDocuments(): Promise<DocumentItem[]> {
  const entries = await getCollection('documente');

  return entries
    .map(({ id, data }) => ({
      id,
      title: data.title,
      category: data.category,
      date: data.date,
      description: data.description ?? undefined,
      ...fileInfo(id, data.file),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title, 'ro'));
}

/** Documents grouped by category, in category order. Empty categories are left out. */
export async function getDocumentGroups(): Promise<DocumentGroup[]> {
  const documents = await getDocuments();

  return categories
    .map((category) => ({ ...category, documents: documents.filter((doc) => doc.category === category.id) }))
    .filter((group) => group.documents.length > 0);
}

function fileInfo(id: string, file: string): Pick<DocumentItem, 'href' | 'external' | 'type' | 'size'> {
  if (file.startsWith('https://')) {
    return { href: file, external: true, type: extension(new URL(file).pathname) };
  }

  const publicPath = safeDecode(file);
  const filePath = path.join(PUBLIC_DIR, publicPath);

  if (!filePath.startsWith(path.join(PUBLIC_DIR, 'fisiere') + path.sep)) {
    throw new Error(`Document "${id}": invalid file path ${file}`);
  }

  let size: number;

  try {
    size = statSync(filePath).size;
  } catch {
    throw new Error(`Document "${id}": file ${file} does not exist in public/`);
  }

  if (size > MAX_FILE_SIZE) {
    throw new Error(
      `Document "${id}": ${file} is ${formatSize(size)}, over Cloudflare's 25 MB limit. Compress it or link to it instead.`,
    );
  }

  return { href: encodeURI(publicPath), external: false, type: extension(publicPath), size };
}

function safeDecode(file: string): string {
  try {
    return decodeURI(file);
  } catch {
    return file;
  }
}

function extension(file: string): string {
  return path.extname(file).slice(1).toUpperCase() || 'LINK';
}

const dateFormat = new Intl.DateTimeFormat('ro-RO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** ISO date (YYYY-MM-DD) for `<time datetime>`. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toLocaleString('ro-RO', { maximumFractionDigits: 1 })} MB`;
}
