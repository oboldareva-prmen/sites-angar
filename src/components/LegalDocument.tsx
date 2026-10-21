import { useEffect } from 'react';
import type { ReactNode } from 'react';
import consentDocument from '../../docs/consent.md?raw';
import privacyDocument from '../../docs/privacy.md?raw';

type LegalDocumentProps = {
  kind: 'consent' | 'privacy';
};

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split('\n');
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {listItems.map((item) => <li key={item}>{formatInline(item)}</li>)}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    if (!line.trim() || line === '---') return;
    if (line.startsWith('# ')) {
      blocks.push(<h1 key={`heading-${index}`}>{formatInline(line.slice(2))}</h1>);
      return;
    }
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={`heading-${index}`}>{formatInline(line.slice(3))}</h2>);
      return;
    }
    blocks.push(<p key={`paragraph-${index}`}>{formatInline(line)}</p>);
  });

  flushList();
  return blocks;
}

export function LegalDocument({ kind }: LegalDocumentProps) {
  const markdown = kind === 'consent' ? consentDocument : privacyDocument;
  const title = kind === 'consent' ? 'Согласие на обработку персональных данных' : 'Политика обработки персональных данных';

  useEffect(() => {
    document.title = `${title} — АНГАР`;
  }, [title]);

  return (
    <main className="legal-page">
      <article className="legal-document">
        <a className="legal-back" href="/">← Вернуться на сайт</a>
        <div className="legal-markdown">{renderMarkdown(markdown)}</div>
        <a className="legal-back legal-back-bottom" href="/">Вернуться на сайт</a>
      </article>
    </main>
  );
}
