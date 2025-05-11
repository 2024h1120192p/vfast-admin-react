import { useEffect } from 'react';
import useHostelStore from './hostelStore';
import { apiRequest } from '../utils/api-client';

// Helper to get today's date in YYYY-MM-DD
function today() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function useHostelSyncStore() {
  const setRooms = useHostelStore(state => state.setRooms);
  const setReservations = useHostelStore(state => state.setReservations);
  const setCustomers = useHostelStore(state => state.setCustomers);
  const setRequests = useHostelStore(state => state.setRequests);

  useEffect(() => {
    async function fetchAndSync() {
      try {
        // 1. Fetch all room statuses
        const roomsResp = await apiRequest(`/rooms/all-status?req_date=${today()}`);
        // 2. Fetch all user bookings (for reservations list)
        const userBookingsResp = await apiRequest('/booking/user-bookings', {}, true);
        // 3. Fetch all pending booking requests
        const bookingRequestsResp = await apiRequest('/booking/booking-requests', {}, true);

        // --- ROOMS ---
        const rooms = Array.isArray(roomsResp?.data?.rooms)
          ? roomsResp.data.rooms.map((r: any, i: number) => ({
              key: r._id || String(i+1),
              number: Number(r.room_number),
              type: r.room_type === 'Standard' || r.room_type === 'Deluxe' || r.room_type === 'Executive' ? r.room_type : 'Standard',
              status: r.status,
              guest: null // No guest info in this API
            }))
          : [];
        setRooms(rooms);

        // --- RESERVATIONS ---
        const bookings = Array.isArray(userBookingsResp?.data?.bookings)
          ? userBookingsResp.data.bookings.map((b: any, i: number) => {
              // Find all rooms assigned to this guest and overlapping this booking
              const assignedRooms = (rooms as import('./hostelStore').Room[]).filter((room) => {
                if (!room.guest || (room.status !== 'On-Hold' && room.status !== 'Occupied')) return false;
                // Match guest name (case-insensitive, trimmed)
                const guestName = b.first_name ? `${b.first_name} ${b.last_name}` : b.email || '';
                if (room.guest.trim().toLowerCase() !== guestName.trim().toLowerCase()) return false;
                return true;
              }).map((r) => r.number);
              return {
                id: b._id || String(i+1),
                rooms: assignedRooms,
                guest: b.first_name ? `${b.first_name} ${b.last_name}` : b.email || '',
                from: b.check_in,
                to: b.check_out,
                status: b.booking_status || 'Reserved',
                cancellationReason: undefined,
              };
            })
          : [];
        setReservations(bookings);

        // --- REQUESTS ---
        const requests = Array.isArray(bookingRequestsResp?.data?.requests)
          ? bookingRequestsResp.data.requests.map((r: any, i: number) => ({
              id: r._id || String(i+1),
              roomType: r.booked_room_type || r.roomType || r.type || '',
              roomsRequired: r.pax || r.roomsRequired || 1,
              name: r.first_name ? `${r.first_name} ${r.last_name}` : '',
              email: '', // Not present in API
              phone: r.phone_number || '',
              referrer: r.gender || 'Student', // No referrer present inAPI, use gender as fallback
              from: r.check_in,
              to: r.check_out,
            }))
          : [];
        setRequests(requests);

        // --- CUSTOMERS ---
        // Infer from bookings and requests (unique by name/email/phone)
        type Customer = {
          key: string;
          name: string;
          email: string;
          phone: string;
          room: number;
        };
        const customers: Customer[] = [];
        const seen = new Set<string>();
        // From bookings
        if (Array.isArray(userBookingsResp?.data?.bookings)) {
          userBookingsResp.data.bookings.forEach((b: any) => {
            const name = b.first_name ? `${b.first_name} ${b.last_name}` : b.email || '';
            const key = name + (b.phone_number || '');
            if (name && !seen.has(key)) {
              seen.add(key);
              customers.push({
                key,
                name,
                email: b.email || '',
                phone: b.phone_number || '',
                room: 0 // No room number in booking
              });
            }
          });
        }
        // From requests
        if (Array.isArray(bookingRequestsResp?.data?.requests)) {
          bookingRequestsResp.data.requests.forEach((r: any) => {
            const name = r.first_name ? `${r.first_name} ${r.last_name}` : '';
            const key = name + (r.phone_number || '');
            if (name && !seen.has(key)) {
              seen.add(key);
              customers.push({
                key,
                name,
                email: '',
                phone: r.phone_number || '',
                room: 0
              });
            }
          });
        }
        setCustomers(customers);
      } catch (e) {
        // Optionally handle error
      }
    }
    fetchAndSync();
    const interval = setInterval(fetchAndSync, 30000); // Refresh in 30 Sec
    return () => {
      clearInterval(interval);
    };
  }, [setRooms, setReservations, setCustomers, setRequests]);
}
