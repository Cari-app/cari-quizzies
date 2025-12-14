import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface ScriptExecutorProps {
  scriptCode: string;
}

/**
 * ScriptExecutor - Safely executes custom scripts when mounted
 * 
 * Security considerations:
 * - Scripts are executed in the context of the page
 * - Only admin users can add scripts (enforced by RLS)
 * - Scripts are executed once when the component mounts
 */
export function ScriptExecutor({ scriptCode }: ScriptExecutorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const executedRef = useRef(false);

  useEffect(() => {
    if (!scriptCode || executedRef.current || !containerRef.current) return;
    
    executedRef.current = true;
    
    try {
      // Parse the script code to extract actual script content
      const scriptContent = extractScriptContent(scriptCode);
      
      if (scriptContent.inlineScripts.length > 0 || scriptContent.externalScripts.length > 0) {
        // Execute external scripts first
        scriptContent.externalScripts.forEach((src) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
        });
        
        // Execute inline scripts
        scriptContent.inlineScripts.forEach((code) => {
          const script = document.createElement('script');
          script.textContent = code;
          document.head.appendChild(script);
        });
      }
      
      // Handle non-script content (like noscript, img pixels, etc.)
      // Sanitize with DOMPurify to prevent XSS from non-script HTML content
      if (scriptContent.otherContent) {
        const temp = document.createElement('div');
        temp.innerHTML = DOMPurify.sanitize(scriptContent.otherContent, {
          ALLOWED_TAGS: ['noscript', 'img', 'div', 'span', 'iframe'],
          ALLOWED_ATTR: ['src', 'alt', 'width', 'height', 'style', 'class', 'id', 'loading', 'referrerpolicy'],
          ALLOW_DATA_ATTR: false,
        });
        // Move children to container
        while (temp.firstChild) {
          containerRef.current?.appendChild(temp.firstChild);
        }
      }
    } catch (error) {
      console.error('[ScriptExecutor] Error executing script:', error);
    }
  }, [scriptCode]);

  // This component renders nothing visible, but provides a container for pixel images
  return <div ref={containerRef} className="hidden" aria-hidden="true" />;
}

/**
 * Extracts script content from HTML string
 */
function extractScriptContent(html: string): {
  inlineScripts: string[];
  externalScripts: string[];
  otherContent: string;
} {
  const inlineScripts: string[] = [];
  const externalScripts: string[] = [];
  let otherContent = html;

  // Match script tags with src attribute (external scripts)
  const externalScriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi;
  let match;
  while ((match = externalScriptRegex.exec(html)) !== null) {
    externalScripts.push(match[1]);
    otherContent = otherContent.replace(match[0], '');
  }

  // Match inline script tags
  const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    if (match[1].trim()) {
      inlineScripts.push(match[1]);
    }
    otherContent = otherContent.replace(match[0], '');
  }

  // Clean up remaining content
  otherContent = otherContent.trim();

  return { inlineScripts, externalScripts, otherContent };
}
