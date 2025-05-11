import { create } from 'zustand';

export type Room = {
  key: string;
  number: number;
  type: 'Standard' | 'Deluxe' | 'Executive';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'On-Hold';
  guest?: string | null;
};
export type Reservation = {
  id: string;
  rooms: number[];
  guest: string;
  from: string;
  to: string;
  status: 'Reserved' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'Pending';
  cancellationReason?: string;
};
export type ReservationRequest = {
  id: string;
  roomType: string;
  roomsRequired: number;
  name: string;
  email: string;
  phone: string;
  referrer: 'Faculty' | 'Alumni' | 'Student' | 'Staff';
  from: string;
  to: string;
};
export type Customer = {
  key: string;
  name: string;
  email: string;
  phone: string;
  room: number;
  previousRoom?: number | null;
  canRevert?: boolean;
};

type HostelState = {
  rooms: Room[];
  reservations: Reservation[];
  customers: Customer[];
  requests: ReservationRequest[];
  // actions
  updateRoomStatus: (roomNumber: number, status: Room['status'], guest?: string | null) => void;
  shiftCustomerRoom: (customerKey: string, newRoom: number, revert?: boolean) => void;
  acceptRequest: (requestId: string, allocatedRooms: number[]) => void;
  rejectRequest: (requestId: string) => void;
  addRequest: (request: Omit<ReservationRequest, 'id'>) => void;
  editRequest: (requestId: string, updatedData: Partial<Omit<ReservationRequest, 'id'>>) => void;
  checkInReservation: (room: number, guest: string) => void;
  checkOutReservation: (room: number, guest: string) => void;
  cancelReservation: (room: number, guest: string, reason: string) => void;
  setRooms: (rooms: Room[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setRequests: (requests: ReservationRequest[]) => void;
};

// initial data (mock)
const initialRooms: Room[] = [
  { key: '1', number: 101, type: 'Deluxe', status: 'On-Hold', guest: 'John Doe' },
  { key: '2', number: 102, type: 'Deluxe', status: 'Available' },
  { key: '3', number: 201, type: 'Executive', status: 'Occupied', guest: 'Jane Smith' },
  { key: '4', number: 202, type: 'Executive', status: 'Available' },
  { key: '5', number: 301, type: 'Standard', status: 'Available' },
  { key: '6', number: 302, type: 'Standard', status: 'On-Hold', guest: 'Alice Brown' },
  { key: '7', number: 401, type: 'Deluxe', status: 'Maintenance' },
  { key: '8', number: 402, type: 'Deluxe', status: 'Available' },
  { key: '9', number: 501, type: 'Executive', status: 'Available' },
];
const initialReservations: Reservation[] = [
  { id: 'res1', rooms: [101], guest: 'John Doe', from: '2025-05-10', to: '2025-05-12', status: 'Reserved' },
  { id: 'res2', rooms: [201], guest: 'Jane Smith', from: '2025-05-09', to: '2025-05-13', status: 'CheckedIn' },
  { id: 'res3', rooms: [302], guest: 'Alice Brown', from: '2025-05-11', to: '2025-05-15', status: 'Reserved' },
];
// initial reservation requests (sample)
const initialRequests: ReservationRequest[] = [
  {
    id: 'r1',
    roomType: 'Single',
    roomsRequired: 1,
    name: 'Bob Builder',
    email: 'bob@student.edu',
    phone: '+91 077980 44008',
    referrer: 'Student',
    from: '2025-05-12',
    to: '2025-05-14'
  }
];
const initialCustomers: Customer[] = [
  { key: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', room: 101 },
  { key: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', room: 201 },
  { key: '3', name: 'Alice Brown', email: 'alice@example.com', phone: '654-987-3210', room: 302 },
];

const useHostelStore = create<HostelState>((set) => ({
  rooms: initialRooms,
  reservations: initialReservations,
  customers: initialCustomers,
  requests: initialRequests,
  addRequest: (request) => {
    set(state => {
      const id = Date.now().toString();
      const newReq: ReservationRequest = { id, ...request };
      return { requests: [...state.requests, newReq] } as Partial<HostelState>;
    });
  },
  updateRoomStatus: (roomNumber, status, guest) => {
    set(state => {
      // Update room status
      const updatedRooms: Room[] = state.rooms.map(r => {
        if (r.number === roomNumber) {
          const updatedRoom: Room = {
            ...r,
            status: status as Room['status'],
            guest: status === 'Occupied' ? (guest ?? r.guest) : null
          };
          return updatedRoom;
        }
        return r;
      });
      // Update reservations accordingly
      let updatedReservations = state.reservations;
      let updatedCustomers = state.customers;
      if (status === 'Occupied' && guest) {
        // Add guest to customers if not present
        if (!state.customers.some(c => c.name === guest)) {
          const newCustomer = {
            key: (state.customers.length + 1).toString(),
            name: guest,
            email: '',
            phone: '',
            room: roomNumber
          };
          updatedCustomers = [...state.customers, newCustomer];
        }
        // Check existing reservation for this room
        const existing = state.reservations.find(r => r.rooms.includes(roomNumber));
        if (existing) {
          updatedReservations = state.reservations.map(r =>
            r.rooms.includes(roomNumber) ? { ...r, guest } : r
          );
        } else {
          // Add new reservation for today to tomorrow
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);
          updatedReservations = [
            ...state.reservations,
            {
              id: Date.now().toString(),
              rooms: [roomNumber],
              guest,
              from: today.toISOString().split('T')[0],
              to: tomorrow.toISOString().split('T')[0],
              status: 'Reserved'
            }
          ];
        }
      } else {
        // Remove any reservation for this room if no longer occupied
        updatedReservations = state.reservations.filter(r => !r.rooms.includes(roomNumber));
      }
      return { rooms: updatedRooms, reservations: updatedReservations, customers: updatedCustomers } as Partial<HostelState>;
    });
  },
  shiftCustomerRoom: (customerKey, newRoom, revert = false) => {
    set(state => {
      const customer = state.customers.find(c => c.key === customerKey);
      if (!customer) return {};
      const oldRoom = customer.room;
      // update customers
      const updatedCustomers = state.customers.map(c => {
        if (c.key === customerKey) {
          if (revert) {
            // On revert, clear previousRoom and canRevert
            return { ...c, room: newRoom, previousRoom: null, canRevert: false };
          } else {
            // On normal shift, set previousRoom and canRevert
            return { ...c, room: newRoom, previousRoom: oldRoom, canRevert: true };
          }
        }
        return c;
      });
      // update rooms occupancy
      const updatedRooms = state.rooms.map(r => {
        if (r.number === oldRoom) return { ...r, status: 'Available', guest: null };
        if (r.number === newRoom) return { ...r, status: 'Occupied', guest: customer.name };
        return r;
      });
      // update reservations: remove old, add new
      let updatedReservations = state.reservations.filter(r => !(r.rooms.includes(oldRoom) && r.guest === customer.name));
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      updatedReservations = [
        ...updatedReservations,
        {
          id: Date.now().toString(),
          rooms: [newRoom],
          guest: customer.name,
          from: today.toISOString().split('T')[0],
          to: tomorrow.toISOString().split('T')[0],
          status: 'Reserved'
        }
      ];
      return { customers: updatedCustomers, rooms: updatedRooms, reservations: updatedReservations } as Partial<HostelState>;
    });
  },
  acceptRequest: (requestId, allocatedRooms) => {
    set(state => {
      const request = state.requests.find(r => r.id === requestId);
      if (!request) return {};
      // remove request
      const updatedRequests = state.requests.filter(r => r.id !== requestId);
      // add reservation with guest name
      const newRes: Reservation = {
        id: Date.now().toString(),
        rooms: allocatedRooms,
        guest: request.name,
        from: request.from,
        to: request.to,
        status: 'Reserved'
      };
      const updatedReservations = [...state.reservations, newRes];
      // add to customers if new
      let updatedCustomers = state.customers;
      if (!state.customers.some(c => c.name === request.name)) {
        updatedCustomers = [
          ...state.customers,
          { key: (state.customers.length + 1).toString(), name: request.name, email: request.email, phone: request.phone, room: allocatedRooms[0] }
        ];
      }
      // Immediately mark allocated rooms On-Hold with guest
      const updatedRooms = state.rooms.map(r =>
        allocatedRooms.includes(r.number)
          ? { ...r, status: 'On-Hold', guest: request.name }
          : r
      );
      return { requests: updatedRequests, reservations: updatedReservations, rooms: updatedRooms, customers: updatedCustomers } as Partial<HostelState>;
    });
  },
  rejectRequest: (requestId) => {
    set(state => ({ requests: state.requests.filter(r => r.id !== requestId) }));
  },
  editRequest: (requestId, updatedData) => {
    set(state => {
      const updatedRequests = state.requests.map(r =>
        r.id === requestId ? { ...r, ...updatedData } : r
      );
      return { requests: updatedRequests } as Partial<HostelState>;
    });
  },
  checkInReservation: (room, guest) => {
    set(state => {
      const updatedReservations = state.reservations.map(r =>
        r.rooms.includes(room) && r.guest === guest && r.status === 'Reserved'
          ? { ...r, status: 'CheckedIn' }
          : r
      );
      const updatedRooms = state.rooms.map(r =>
        r.number === room
          ? { ...r, status: 'Occupied', guest }
          : r
      );
      return { reservations: updatedReservations, rooms: updatedRooms } as Partial<HostelState>;
    });
  },
  checkOutReservation: (room, guest) => {
    set(state => {
      const updatedReservations = state.reservations.map(r =>
        r.rooms.includes(room) && r.guest === guest && r.status === 'CheckedIn'
          ? { ...r, status: 'CheckedOut' }
          : r
      );
      const updatedRooms = state.rooms.map(r =>
        r.number === room
          ? { ...r, status: 'Available', guest: null }
          : r
      );
      return { reservations: updatedReservations, rooms: updatedRooms } as Partial<HostelState>;
    });
  },
  cancelReservation: (room, guest, reason) => {
    set(state => {
      const updatedReservations = state.reservations.map(r =>
        r.rooms.includes(room) && r.guest === guest && (r.status === 'Reserved' || r.status === 'CheckedIn')
          ? { ...r, status: 'Cancelled', cancellationReason: reason }
          : r
      );
      const updatedRooms = state.rooms.map(r =>
        r.number === room
          ? { ...r, status: 'Available', guest: null }
          : r
      );
      return { reservations: updatedReservations, rooms: updatedRooms } as Partial<HostelState>;
    });
  },
  setRooms: (rooms: Room[]) => set(() => ({ rooms })),
  setReservations: (reservations: Reservation[]) => set(() => ({ reservations })),
  setCustomers: (customers: Customer[]) => set(() => ({ customers })),
  setRequests: (requests: ReservationRequest[]) => set(() => ({ requests })),
}));

export default useHostelStore;
