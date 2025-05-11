import { DesktopOutlined } from '@ant-design/icons';
import type { AdminRouterItem } from '../../router';
import HotelDashboard from './index';
import RoomsPage from './rooms';
import ReservationsPage from './reservations';
import CustomersPage from './customers';

// Top-level hotel pages as separate tabs
const hotelRoutes: AdminRouterItem[] = [
  {
    path: 'dashboard',
    element: <HotelDashboard />,  
    meta: {
      label: 'Dashboard',
      title: 'Hotel Dashboard',
      key: '/dashboard',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'rooms',
    element: <RoomsPage />,  
    meta: {
      label: 'Rooms',
      title: 'Rooms',
      key: '/rooms',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'reservations',
    element: <ReservationsPage />,  
    meta: {
      label: 'Reservations',
      title: 'Reservations',
      key: '/reservations',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'customers',
    element: <CustomersPage />,  
    meta: {
      label: 'Customers',
      title: 'Customers',
      key: '/customers',
      icon: <DesktopOutlined />,
    }
  }
];

export default hotelRoutes;
