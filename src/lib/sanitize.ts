import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe HTML formatting while stripping malicious scripts.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'strong', 'span', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'div', 'font'],
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'color', 'size'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizes embed code for video embeds.
 * Only allows iframe elements with specific attributes for known video platforms.
 */
export function sanitizeEmbed(embedCode: string | undefined | null): string {
  if (!embedCode) return '';
  
  return DOMPurify.sanitize(embedCode, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });
}
