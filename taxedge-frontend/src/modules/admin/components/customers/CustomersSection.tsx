import { getAdminNavItem } from '../../shared/adminNavigation';
import { AdminSectionView } from '../shared/AdminSectionView';

/** Admin "Customers" section. Build its tables, forms and widgets in this folder. */
export default function CustomersSection() {
  return <AdminSectionView item={getAdminNavItem('customers')} />;
}
