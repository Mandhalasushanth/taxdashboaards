import { useEffect } from 'react';
import { Button, Icon } from '@/shared';
import { PAYMENT_METHOD_LABELS, type RevenueTransaction } from '../../shared/revenue.types';
import './RevenueInvoiceModal.css';

export interface RevenueInvoiceModalProps {
  readonly transaction: RevenueTransaction;
  readonly onClose: () => void;
}

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function renderInvoiceHead(transaction: RevenueTransaction) {
  return (
    <div className="tx-rev-inv-head">
      <div className="tx-rev-inv-brand">
        <span className="tx-rev-inv-logo">TaxEdge</span>
        <p className="tx-rev-inv-company">TaxEdge Financial Technologies Pvt Ltd</p>
        <p className="tx-rev-inv-address">
          Level 12, Tower B, Bandra Kurla Complex (BKC), Mumbai 400051, Maharashtra
        </p>
        <p className="tx-rev-inv-meta">
          <strong>GSTIN:</strong> 27AABCT9821M1Z5 • <strong>PAN:</strong> AABCT9821M • <strong>CIN:</strong> U74999MH2024PTC198421
        </p>
      </div>
      <div className="tx-rev-inv-meta-right">
        <h2 id="tx-inv-title" className="tx-rev-inv-heading">TAX INVOICE</h2>
        <table className="tx-rev-inv-kv">
          <tbody>
            <tr>
              <th>Invoice No:</th>
              <td><strong>{transaction.invoiceNumber}</strong></td>
            </tr>
            <tr>
              <th>Invoice Date:</th>
              <td>{transaction.date}</td>
            </tr>
            <tr>
              <th>Due Date:</th>
              <td>{transaction.dueDate}</td>
            </tr>
            <tr>
              <th>Place of Supply:</th>
              <td>{transaction.clientState}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderBillTo(transaction: RevenueTransaction) {
  return (
    <div className="tx-rev-inv-billto">
      <span className="tx-rev-inv-section-title">Billed To (Client / Entity):</span>
      <p className="tx-rev-inv-client-name">{transaction.customerName}</p>
      <p className="tx-rev-inv-client-sub">
        <strong>PAN:</strong> {transaction.customerPan}
        {transaction.customerGstin ? ` • GSTIN: ${transaction.customerGstin}` : ''}
      </p>
      <p className="tx-rev-inv-client-sub">
        {transaction.clientCity}, {transaction.clientState}, India
      </p>
    </div>
  );
}

function renderItemsTable(transaction: RevenueTransaction, isIntraState: boolean, cgst: number, sgst: number, igst: number) {
  return (
    <table className="tx-rev-inv-items">
      <thead>
        <tr>
          <th>#</th>
          <th>Service Description</th>
          <th>SAC Code</th>
          <th className="tx-rev-inv-num">Taxable Value</th>
          {isIntraState ? (
            <>
              <th className="tx-rev-inv-num">CGST (9%)</th>
              <th className="tx-rev-inv-num">SGST (9%)</th>
            </>
          ) : (
            <th className="tx-rev-inv-num">IGST (18%)</th>
          )}
          <th className="tx-rev-inv-num">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <strong>{transaction.serviceName}</strong>
            <div className="tx-rev-inv-desc-sub">
              Professional consultation, statutory e-filing & regulatory portal submission.
            </div>
          </td>
          <td>{transaction.sacCode}</td>
          <td className="tx-rev-inv-num">{INR.format(transaction.baseAmount)}</td>
          {isIntraState ? (
            <>
              <td className="tx-rev-inv-num">{INR.format(cgst)}</td>
              <td className="tx-rev-inv-num">{INR.format(sgst)}</td>
            </>
          ) : (
            <td className="tx-rev-inv-num">{INR.format(igst)}</td>
          )}
          <td className="tx-rev-inv-num tx-rev-inv-total-cell">{INR.format(transaction.totalAmount)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={isIntraState ? 5 : 4} className="tx-rev-inv-num">
            <strong>Total Invoice Value (INR):</strong>
          </td>
          <td className="tx-rev-inv-num tx-rev-inv-grand-total">
            <strong>{INR.format(transaction.totalAmount)}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function renderSettlement(transaction: RevenueTransaction) {
  return (
    <div className="tx-rev-inv-settlement">
      <div className="tx-rev-inv-settlement-left">
        <p className="tx-rev-inv-settlement-title">Payment & Settlement Information</p>
        <p className="tx-rev-inv-settlement-desc">
          Payment Channel: <strong>{PAYMENT_METHOD_LABELS[transaction.paymentMethod]}</strong>
        </p>
        <p className="tx-rev-inv-settlement-desc">
          Gateway Reference / Bank UTR: <code>{transaction.paymentReference}</code>
        </p>
        <p className="tx-rev-inv-settlement-note">
          Payment received in full. Thank you for partnering with TaxEdge.
        </p>
      </div>
      <div className="tx-rev-inv-settlement-sign">
        <div className="tx-rev-inv-stamp">TAXEDGE VERIFIED</div>
        <p className="tx-rev-inv-signatory">Authorized Signatory</p>
        <p className="tx-rev-inv-signatory-sub">TaxEdge Financial Technologies Pvt Ltd</p>
      </div>
    </div>
  );
}

export function RevenueInvoiceModal({ transaction, onClose }: RevenueInvoiceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        if (e.key === 'Escape') onClose();
      } catch (err) {
        // Exception handling
        console.error('Error in keyboard handler:', err);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isIntraState = transaction.clientState === 'Maharashtra';
  const cgst = isIntraState ? Math.round(transaction.gstAmount / 2) : 0;
  const sgst = isIntraState ? Math.round(transaction.gstAmount / 2) : 0;
  const igst = !isIntraState ? transaction.gstAmount : 0;

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Printing failed:', err);
    }
  };

  return (
    <div className="tx-rev-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="tx-inv-title">
      <div className="tx-rev-modal-backdrop" onClick={onClose} />
      <div className="tx-rev-modal">
        <div className="tx-rev-modal__toolbar">
          <div className="tx-rev-modal__status-tag tx-rev-modal__status-tag--paid">
            <Icon name="circle-check" size="sm" />
            <span>Official GST Tax Invoice • {transaction.status}</span>
          </div>
          <div className="tx-rev-modal__actions">
            <Button variant="secondary" iconName="printer" onClick={handlePrint}>
              Print
            </Button>
            <button type="button" className="tx-rev-modal__close-btn" onClick={onClose} aria-label="Close invoice dialog">
              <Icon name="x" size="sm" />
            </button>
          </div>
        </div>

        <div className="tx-rev-invoice-paper" id="tx-printable-invoice">
          {renderInvoiceHead(transaction)}
          <hr className="tx-rev-inv-divider" />
          {renderBillTo(transaction)}
          {renderItemsTable(transaction, isIntraState, cgst, sgst, igst)}
          {renderSettlement(transaction)}
          <div className="tx-rev-inv-footer">
            <p>
              This is a computer-generated tax invoice issued in accordance with Section 31 of the Central Goods and Services Tax Act, 2017.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
