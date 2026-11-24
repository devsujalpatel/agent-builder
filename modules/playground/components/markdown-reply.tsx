import { memo } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './markdown-reply.module.css';

const components: Components = {
  a: ({ href, children }) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  img: ({ alt }) => (alt ? <span>{alt}</span> : null),
  table: ({ children }) => (
    <div className={styles.table} role="region" aria-label="Table" tabIndex={0}>
      <table>{children}</table>
    </div>
  ),
};

export const MarkdownReply = memo(function MarkdownReply({
  content,
}: {
  content: string;
}) {
  return (
    <div className={styles.reply}>
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {content}
      </Markdown>
    </div>
  );
});
