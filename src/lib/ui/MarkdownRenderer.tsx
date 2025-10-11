'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * CopyButton component for code blocks
 * Provides one-click copy functionality with visual feedback
 */
interface CopyButtonProps {
  content: string;
}

function CopyButton({ content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

/**
 * MarkdownRenderer component
 * Renders markdown content with syntax highlighting, custom components, and proper styling
 */
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const components: Components = {
    // Custom code component with syntax highlighting and copy button
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      const isInline = !match && !className?.includes('language-');

      return !isInline && match ? (
        <div className="group relative">
          <pre className={className}>
            <code className={className}>{children}</code>
          </pre>
          <CopyButton content={codeContent} />
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // Custom link component with security attributes
    a({ href, children, ...props }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },

    // Custom heading components with proper spacing
    h1({ children, ...props }) {
      return (
        <h1 className="mt-6 mb-4 text-3xl font-semibold" {...props}>
          {children}
        </h1>
      );
    },

    h2({ children, ...props }) {
      return (
        <h2 className="mt-5 mb-3 text-2xl font-semibold" {...props}>
          {children}
        </h2>
      );
    },

    h3({ children, ...props }) {
      return (
        <h3 className="mt-4 mb-2 text-xl font-semibold" {...props}>
          {children}
        </h3>
      );
    },

    // Custom paragraph with proper spacing
    p({ children, ...props }) {
      return (
        <p className="my-3 leading-relaxed" {...props}>
          {children}
        </p>
      );
    },

    // Custom list components with proper spacing
    ul({ children, ...props }) {
      return (
        <ul className="my-3 list-disc pl-6 space-y-1" {...props}>
          {children}
        </ul>
      );
    },

    ol({ children, ...props }) {
      return (
        <ol className="my-3 list-decimal pl-6 space-y-1" {...props}>
          {children}
        </ol>
      );
    },

    // Custom blockquote with proper styling
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground"
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // Custom table components with proper styling
    table({ children, ...props }) {
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse" {...props}>
            {children}
          </table>
        </div>
      );
    },

    th({ children, ...props }) {
      return (
        <th
          className="border border-border bg-muted px-3 py-2 text-left font-semibold"
          {...props}
        >
          {children}
        </th>
      );
    },

    td({ children, ...props }) {
      return (
        <td className="border border-border px-3 py-2" {...props}>
          {children}
        </td>
      );
    },

    // Custom image with proper styling
    img({ src, alt, ...props }) {
      return (
        <img
          src={src}
          alt={alt}
          className="my-4 max-w-full rounded-md"
          loading="lazy"
          {...props}
        />
      );
    },

    // Custom horizontal rule
    hr({ ...props }) {
      return <hr className="my-8 border-border" {...props} />;
    },
  };

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-p:text-foreground prose-p:leading-relaxed',
        'prose-a:text-accent prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-[#1e1e1e] prose-pre:text-[#d4d4d4] prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4',
        'prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:my-1',
        'prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-4',
        'prose-table:w-full prose-table:border-collapse prose-table:my-4',
        'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold',
        'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
        'prose-img:rounded-md prose-img:my-4 prose-img:max-w-full',
        'prose-hr:border-border prose-hr:my-8',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
