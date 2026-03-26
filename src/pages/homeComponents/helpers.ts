export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
};

export const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

export const buildImageUrl = (path: string | null | undefined, baseURL: string): string => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  return `${baseURL}/${path.replace(/^\//, "")}`;
};