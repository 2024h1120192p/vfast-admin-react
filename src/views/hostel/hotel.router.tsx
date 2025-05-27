import { DesktopOutlined } from '@ant-design/icons';
import type { AdminRouterItem } from '../../router';
import { lazy, Suspense } from 'react';

// Lazy-loaded views for code-splitting
const HotelDashboard = lazy(() => import('./index'));
const RoomsPage = lazy(() => import('./rooms'));
const ReservationsPage = lazy(() => import('./reservations'));
const CustomersPage = lazy(() => import('./customers'));
const CalendarView = lazy(() => import('./calendarView'));

// Top-level hotel pages as separate tabs
const hotelRoutes: AdminRouterItem[] = [
  {
    path: 'dashboard',
    element: (
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <HotelDashboard />
      </Suspense>
    ),  
    meta: {
      label: 'Dashboard',
      title: 'Hotel Dashboard',
      key: '/dashboard',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'rooms',
    element: (
      <Suspense fallback={<div>Loading Rooms...</div>}>
        <RoomsPage />
      </Suspense>
    ),  
    meta: {
      label: 'Rooms',
      title: 'Rooms',
      key: '/rooms',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'reservations',
    element: (
      <Suspense fallback={<div>Loading Reservations...</div>}>
        <ReservationsPage />
      </Suspense>
    ),  
    meta: {
      label: 'Reservations',
      title: 'Reservations',
      key: '/reservations',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'customers',
    element: (
      <Suspense fallback={<div>Loading Customers...</div>}>
        <CustomersPage />
      </Suspense>
    ),  
    meta: {
      label: 'Customers',
      title: 'Customers',
      key: '/customers',
      icon: <DesktopOutlined />,
    }
  },
  {
    path: 'calendar',
    element: (
      <Suspense fallback={<div>Loading Calendar...</div>}>
        <CalendarView />
      </Suspense>
    ),
    meta: {
      label: 'Calendar',
      title: 'Reservation Calendar',
      key: '/calendar',
      icon: <DesktopOutlined />,
    }
  }
];

export default hotelRoutes;
