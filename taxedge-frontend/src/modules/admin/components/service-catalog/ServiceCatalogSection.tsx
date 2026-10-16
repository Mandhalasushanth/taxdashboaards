import { getAdminNavItem } from '../../shared/adminNavigation';
import { AdminSectionView } from '../shared/AdminSectionView';

/** Admin "Service Catalog" section. Build its tables, forms and widgets in this folder. */
export default function ServiceCatalogSection() {
  return <AdminSectionView item={getAdminNavItem('services')} />;
}
