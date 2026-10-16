import type { ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly badge?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, badge }: PageHeaderProps) {
  return (
    <section className="tx-page-header">
      <div className="tx-page-header__pattern" aria-hidden="true" />
      <div className="tx-page-header__text">
        <p className="tx-page-header__eyebrow">{eyebrow}</p>
        <h1 className="tx-page-header__title">{title}</h1>
        <p className="tx-page-header__description">{description}</p>
      </div>
      {badge ? <div className="tx-page-header__badge">{badge}</div> : null}
    </section>
  );
}
