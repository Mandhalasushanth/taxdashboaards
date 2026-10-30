import { describe, expect, it } from 'vitest';
import { entityTypeFromPan } from '@/modules/admin/shared/customers.types';
import type { CatalogServiceUpdate } from '@/modules/admin/shared/serviceCatalog.types';
import { parseCustomerList } from '@/modules/admin/validation/customersSchema';
import { parseServiceCatalog, validateCatalogUpdate } from '@/modules/admin/validation/serviceCatalogSchema';

describe('customer directory', () => {
  it('derives the holder type from the 4th PAN character', () => {
    expect(entityTypeFromPan('ABCPK1234L')).toBe('INDIVIDUAL');
    expect(entityTypeFromPan('AAACT1234F')).toBe('COMPANY');
    expect(entityTypeFromPan('AAKFK4821M')).toBe('FIRM');
    expect(entityTypeFromPan('AAAHX1234Q')).toBe('HUF');
    expect(entityTypeFromPan('AAAGX1234Q')).toBe('OTHER');
  });

  it('keeps valid customers and drops applications it cannot label', () => {
    const [customer] = parseCustomerList({
      items: [
        {
          name: 'Asha Traders',
          pan: 'AAKFA1234M',
          entityType: 'FIRM',
          applications: [
            { caseId: 'CASE-1', service: 'GST', status: 'SUBMITTED' },
            { caseId: 'CASE-2', service: 'CRYPTO', status: 'SUBMITTED' }
          ]
        },
        { name: '', pan: '' }
      ]
    });
    expect(customer.id).toBe('AAKFA1234M');
    expect(customer.applications).toHaveLength(1);
  });

  it('rejects a payload that is not a list', () => {
    expect(() => parseCustomerList({ data: 'nope' })).toThrow();
  });
});

describe('service catalog', () => {
  const valid: CatalogServiceUpdate = { name: 'GST Returns', description: '', feeModel: 'FIXED', feeValue: 1499, gstRate: 18, slaDays: 5, active: true };

  it('accepts a valid fixed-fee and percentage-fee update', () => {
    expect(validateCatalogUpdate(valid)).toEqual({});
    expect(validateCatalogUpdate({ ...valid, feeModel: 'PERCENTAGE', feeValue: 0.5 })).toEqual({});
  });

  it('validates each field by its type', () => {
    const errors = validateCatalogUpdate({ ...valid, name: 'G', feeValue: 12.5, slaDays: 200, gstRate: 7 as CatalogServiceUpdate['gstRate'] });
    expect(Object.keys(errors).sort()).toEqual(['feeValue', 'gstRate', 'name', 'slaDays']);
    expect(validateCatalogUpdate({ ...valid, feeModel: 'PERCENTAGE', feeValue: 0.123 }).feeValue).toBeDefined();
  });

  it('takes team and documents from the service configuration, not the server payload', () => {
    const [service] = parseServiceCatalog([{ kind: 'LOAN', team: 'CA', feeModel: 'PERCENTAGE', feeValue: 0.5, gstRate: 18 }]);
    expect(service.team).toBe('LOAN');
    expect(service.requiredDocuments.length).toBeGreaterThan(0);
  });
});
