import { useMemo } from 'react';
import { Button, Icon } from '@/shared';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  type PaymentStatusFilter,
  type RevenueTransaction
} from '../../shared/revenue.types';
import './RevenueLedger.css';

export interface RevenueTransactionsTableProps {
  readonly transactions: readonly RevenueTransaction[];
  readonly statusFilter: PaymentStatusFilter;
  readonly onStatusFilterChange: (status: PaymentStatusFilter) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onSelectInvoice: (tx: RevenueTransaction) => void;
  readonly onExportCsv: () => void;
}

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const STATUS_FILTERS: readonly PaymentStatusFilter[] = ['ALL', ...PAYMENT_STATUSES];

export interface SearchValidationFeedback {
  readonly isValid: boolean;
  readonly message: string;
  readonly tone: 'neutral' | 'success' | 'warning' | 'error';
  readonly detectedType: 'EMPTY' | 'PAN' | 'INVOICE' | 'NAME' | 'SERVICE' | 'INVALID';
}

/**
 * Validates search input dynamically according to placeholder types:
 * "Search by invoice #, customer name, PAN, or service..."
 */
function validateSearchInput(input: string): SearchValidationFeedback {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        isValid: true,
        message: 'Search across all invoices, client names, PANs, cities or services.',
        tone: 'neutral',
        detectedType: 'EMPTY'
      };
    }

    // Check for disallowed / unsafe injection characters
    const hasUnsafeChars = /[<>{};\\`$]/.test(trimmed);
    if (hasUnsafeChars) {
      return {
        isValid: false,
        message: 'Special scripting characters (<, >, {, }, ;, `) are disallowed.',
        tone: 'error',
        detectedType: 'INVALID'
      };
    }

    // 1. Check if user is searching by PAN (starts like 5 uppercase letters or 5 alphabets)
    const upper = trimmed.toUpperCase();
    const panFullRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const panPartialRegex = /^[A-Z]{1,5}[0-9]{0,4}[A-Z]{0,1}$/;

    if (panFullRegex.test(upper)) {
      return {
        isValid: true,
        message: `Valid PAN Format: ${upper} (Permanent Account Number match)`,
        tone: 'success',
        detectedType: 'PAN'
      };
    }

    if (upper.length >= 3 && upper.length < 10 && panPartialRegex.test(upper)) {
      return {
        isValid: true,
        message: `Entering PAN: ${upper.length}/10 characters (Format: 5 letters, 4 digits, 1 letter)`,
        tone: 'warning',
        detectedType: 'PAN'
      };
    }

    // 2. Check if user is searching by Invoice Number (starts with 'TE' or 'INV' or contains slashes)
    if (upper.startsWith('TE') || upper.startsWith('INV') || (upper.includes('/') && /\d/.test(upper))) {
      const isCompleteInvoice = /^TE\/\d{2}-\d{2}\/\d+$/.test(upper);
      return {
        isValid: true,
        message: isCompleteInvoice
          ? `Invoice Number Pattern Matched: ${upper}`
          : `Invoice Search: Filtering by TaxEdge invoice identifier (${upper})`,
        tone: isCompleteInvoice ? 'success' : 'neutral',
        detectedType: 'INVOICE'
      };
    }

    // 3. Check if service keyword
    const serviceKeywords = ['ITR', 'GST', 'AUDIT', 'LOAN', 'NRI', 'TDS', 'ROC', 'LAP', 'MSME', 'SYNDICATE'];
    const isServiceMatch = serviceKeywords.some((keyword) => upper.includes(keyword));
    if (isServiceMatch) {
      return {
        isValid: true,
        message: `Service Filter: Matching service category (${trimmed})`,
        tone: 'success',
        detectedType: 'SERVICE'
      };
    }

    // 4. Standard Name search
    return {
      isValid: true,
      message: `Customer & Entity Search: Matching clients for "${trimmed}"`,
      tone: 'neutral',
      detectedType: 'NAME'
    };
  } catch (err) {
    return {
      isValid: false,
      message: `Search validation error: ${(err as Error).message}`,
      tone: 'error',
      detectedType: 'INVALID'
    };
  }
}

function renderStatusBadge(status: RevenueTransaction['status']) {
  switch (status) {
    case 'PAID':
      return <span className="tx-rev-status tx-rev-status--paid">Settled</span>;
    case 'PENDING':
      return <span className="tx-rev-status tx-rev-status--pending">Pending</span>;
    case 'OVERDUE':
      return <span className="tx-rev-status tx-rev-status--overdue">Overdue</span>;
    case 'REFUNDED':
      return <span className="tx-rev-status tx-rev-status--refunded">Refunded</span>;
  }
}

function renderTableRow(tx: RevenueTransaction, onSelectInvoice: (tx: RevenueTransaction) => void) {
  return (
    <tr key={tx.id} className="tx-rev-table__row">
      <td>
        <div className="tx-rev-table__inv-cell">
          <span className="tx-rev-table__inv-no">{tx.invoiceNumber}</span>
          <span className="tx-rev-table__inv-date">{tx.date}</span>
        </div>
      </td>
      <td>
        <div className="tx-rev-table__cust-cell">
          <span className="tx-rev-table__cust-name">{tx.customerName}</span>
          <span className="tx-rev-table__cust-meta">
            PAN: {tx.customerPan} • {tx.clientCity}
          </span>
        </div>
      </td>
      <td>
        <div className="tx-rev-table__srv-cell">
          <span className="tx-rev-table__srv-name">{tx.serviceName}</span>
          <span className="tx-rev-table__srv-meta">
            <span className={`tx-rev-mini-tag tx-rev-mini-tag--${tx.division === 'TAX_CA' ? 'tax' : 'loan'}`}>
              {tx.division === 'TAX_CA' ? 'CA' : 'Loan'}
            </span>
            SAC: {tx.sacCode}
          </span>
        </div>
      </td>
      <td className="tx-rev-table__num">{INR.format(tx.baseAmount)}</td>
      <td className="tx-rev-table__num tx-rev-table__num--muted">{INR.format(tx.gstAmount)}</td>
      <td className="tx-rev-table__num tx-rev-table__num--bold">{INR.format(tx.totalAmount)}</td>
      <td>
        <div className="tx-rev-table__pay-cell">
          <span className="tx-rev-table__pay-method">{PAYMENT_METHOD_LABELS[tx.paymentMethod]}</span>
          <span className="tx-rev-table__pay-ref">Ref: {tx.paymentReference}</span>
        </div>
      </td>
      <td>{renderStatusBadge(tx.status)}</td>
      <td className="tx-rev-table__action">
        <button
          type="button"
          className="tx-rev-action-btn"
          onClick={() => onSelectInvoice(tx)}
          title="View Official Tax Invoice"
          aria-label={`View Tax Invoice ${tx.invoiceNumber}`}
        >
          <Icon name="file-text" size="sm" />
          <span>Invoice</span>
        </button>
      </td>
    </tr>
  );
}

function renderEmptyState() {
  return (
    <tr>
      <td colSpan={9} className="tx-rev-table__empty">
        <div className="tx-rev-table__empty-state">
          <Icon name="receipt" size="lg" />
          <p className="tx-rev-table__empty-title">No transactions match your search filter</p>
          <p className="tx-rev-table__empty-desc">
            Try adjusting your search query, status tab, or active practice vertical.
          </p>
        </div>
      </td>
    </tr>
  );
}

export function RevenueTransactionsTable({
  transactions,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onSelectInvoice,
  onExportCsv
}: RevenueTransactionsTableProps) {
  const validation = useMemo(() => validateSearchInput(searchQuery), [searchQuery]);

  const handleExportSafe = () => {
    try {
      onExportCsv();
    } catch (err) {
      console.error('Export CSV exception:', err);
    }
  };

  const handleSearchChangeSafe = (val: string) => {
    try {
      onSearchChange(val);
    } catch (err) {
      console.error('Search input exception:', err);
    }
  };

  return (
    <div className="tx-rev-ledger">
      <div className="tx-rev-ledger__header">
        <div>
          <h3 className="tx-rev-ledger__title">Billing & Collections Ledger</h3>
          <p className="tx-rev-ledger__subtitle">
            Itemized GST tax invoices, banking partner remittances and payment transaction receipts
          </p>
        </div>
        <Button variant="secondary" iconName="download" onClick={handleExportSafe}>
          Export Ledger (CSV)
        </Button>
      </div>

      <div className="tx-rev-ledger__filters">
        <div className="tx-rev-ledger__search-box">
          <div
            className={`tx-rev-ledger__search ${
              validation.tone === 'error'
                ? 'tx-rev-ledger__search--error'
                : validation.tone === 'warning'
                ? 'tx-rev-ledger__search--warning'
                : validation.tone === 'success'
                ? 'tx-rev-ledger__search--valid'
                : ''
            }`}
          >
            <Icon name="search" size="sm" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChangeSafe(e.target.value)}
              placeholder="Search by invoice #, customer name, PAN, or service..."
              aria-label="Search invoices"
              aria-invalid={!validation.isValid}
            />
            {searchQuery && (
              <button
                type="button"
                className="tx-rev-ledger__clear"
                onClick={() => handleSearchChangeSafe('')}
                aria-label="Clear search"
              >
                <Icon name="x" size="sm" />
              </button>
            )}
          </div>
          <div
            className={`tx-rev-search-validation tx-rev-search-validation--${validation.tone}`}
            role="status"
            aria-live="polite"
          >
            <Icon
              name={
                validation.tone === 'error'
                  ? 'alert-circle'
                  : validation.tone === 'success'
                  ? 'circle-check'
                  : validation.tone === 'warning'
                  ? 'clock'
                  : 'search'
              }
              size="sm"
            />
            <span>{validation.message}</span>
          </div>
        </div>

        <div className="tx-rev-ledger__status-tabs" role="tablist" aria-label="Invoice payment status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={statusFilter === s}
              className={`tx-rev-ledger__status-tab ${statusFilter === s ? 'tx-rev-ledger__status-tab--active' : ''}`}
              onClick={() => onStatusFilterChange(s)}
            >
              {PAYMENT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="tx-rev-ledger__table-wrapper">
        <table className="tx-rev-table">
          <thead>
            <tr>
              <th scope="col">Invoice # & Date</th>
              <th scope="col">Customer / Entity</th>
              <th scope="col">Service & Vertical</th>
              <th scope="col" className="tx-rev-table__num">Taxable Value</th>
              <th scope="col" className="tx-rev-table__num">GST (18%)</th>
              <th scope="col" className="tx-rev-table__num">Total Amount</th>
              <th scope="col">Payment Mode</th>
              <th scope="col">Status</th>
              <th scope="col" className="tx-rev-table__action">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0
              ? renderEmptyState()
              : transactions.map((tx) => renderTableRow(tx, onSelectInvoice))}
          </tbody>
        </table>
      </div>

      <div className="tx-rev-ledger__footer">
        <span className="tx-rev-ledger__count">
          Showing <strong>{transactions.length}</strong> recorded transaction entries
        </span>
      </div>
    </div>
  );
}
