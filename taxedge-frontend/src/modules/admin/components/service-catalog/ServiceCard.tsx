import { formatDateTime } from '@/core/utils/dateUtils';
import { getServiceDefinition } from '@/modules/workflow';
import { Button, Icon } from '@/shared';
import type { CatalogService } from '../../shared/serviceCatalog.types';
import './ServiceCard.css';

const RUPEES = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** "₹1,499 + 18% GST" or "0.5% of amount + 18% GST". */
export function formatFee(service: Pick<CatalogService, 'feeModel' | 'feeValue' | 'gstRate'>): string {
  const base = service.feeModel === 'FIXED' ? RUPEES.format(service.feeValue) : `${service.feeValue}% of amount`;
  return service.gstRate > 0 ? `${base} + ${service.gstRate}% GST` : base;
}

export interface ServiceCardProps {
  readonly service: CatalogService;
  readonly onEdit: () => void;
}

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const definition = getServiceDefinition(service.kind);
  const teamClass = service.team === 'CA' ? 'tx-service-card--ca' : 'tx-service-card--loan';

  return (
    <article className={`tx-service-card ${teamClass} ${service.active ? '' : 'tx-service-card--inactive'}`.trim()} aria-label={service.name}>
      <header className="tx-service-card__header">
        <span className="tx-service-card__icon">
          <Icon name={definition.iconName} />
        </span>
        <div className="tx-service-card__titles">
          <h3 className="tx-service-card__name">{service.name}</h3>
          <p className="tx-service-card__team">{service.team === 'CA' ? 'CA Manager → CA Agent' : 'Loan Manager → Loan Agent'}</p>
        </div>
        <span className={`tx-service-card__status ${service.active ? 'tx-service-card__status--on' : 'tx-service-card__status--off'}`}>
          {service.active ? 'Active' : 'Paused'}
        </span>
      </header>

      {service.description ? <p className="tx-service-card__description">{service.description}</p> : null}

      <dl className="tx-service-card__facts">
        <div>
          <dt>Professional fee</dt>
          <dd>{formatFee(service)}</dd>
        </div>
        <div>
          <dt>Turnaround</dt>
          <dd>{service.slaDays} days</dd>
        </div>
      </dl>

      <div className="tx-service-card__docs">
        <p className="tx-service-card__docs-title">Required documents</p>
        <ul>
          {service.requiredDocuments.map((doc) => (
            <li key={doc}>
              <Icon name="check" size="sm" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      <footer className="tx-service-card__footer">
        <span className="tx-service-card__updated">{service.updatedAt ? `Updated ${formatDateTime(service.updatedAt)}` : 'Default settings'}</span>
        <Button variant="secondary" iconName="sliders" onClick={onEdit}>
          Edit
        </Button>
      </footer>
    </article>
  );
}
