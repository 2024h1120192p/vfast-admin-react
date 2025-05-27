import React, { useState, lazy, Suspense } from 'react';
import { Calendar, Modal, List, Tag, Button, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import useHostelStore from '../../store/hostelStore';
import type { Reservation } from '../../store/hostelStore';
import './calendarView.css';

dayjs.extend(isBetween);

const ReservationDetailModal = lazy(() => import('./ReservationDetailModal'));

const CalendarView: React.FC = () => {
  const reservationData = useHostelStore(state => state.reservations) as Reservation[];
  const [selectedDate, setSelectedDate] = useState<Dayjs | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Reservations for the selected day
  const reservationsOnDate = selectedDate
    ? reservationData.filter(r => {
        const from = dayjs(r.from).startOf('day');
        const to = dayjs(r.to).startOf('day');
        return selectedDate.isBetween(from, to, 'day', '[]');
      })
    : [];

  return (
    <div>
      <h2>Reservation Calendar</h2>
      <Calendar
        cellRender={(date, info) => {
          if (info.type !== 'date') return null;
          // Gather all reservations covering this date
          const reservationsForDate = reservationData.filter(r => {
            const from = dayjs(r.from).startOf('day');
            const to = dayjs(r.to).startOf('day');
            return date.isBetween(from, to, 'day', '[]');
          });
          const count = reservationsForDate.length;
          if (count === 0) return null;
          // Tooltip content: list of guest names
          const guestList = reservationsForDate.map(r => r.guest).join(', ');
          return (
            <Tooltip title={`Guests: ${guestList}`}>
              <div
                className="calendar-cell-clickable"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedDate(date.startOf('day'));
                  setModalOpen(true);
                }}
              >
                <span className="reservation-badge">{count}</span>
              </div>
            </Tooltip>
          );
        }}
        onPanelChange={() => {
          setModalOpen(false);
          setSelectedReservation(null);
        }}
      />
      <Modal
        open={modalOpen}
        title={selectedDate ? `Reservations on ${selectedDate.format('YYYY-MM-DD')}` : 'Reservations'}
        onCancel={() => {
          setModalOpen(false);
          setSelectedReservation(null);
        }}
        footer={<Button onClick={() => {
          setModalOpen(false);
          setSelectedReservation(null);
        }}>Close</Button>}
      >
        <List
          dataSource={reservationsOnDate}
          locale={{ emptyText: 'No reservations on this day.' }}
          renderItem={item => (
            <List.Item
              key={item.id ? item.id : `${item.guest}-${item.from}-${item.to}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedReservation(item)}
            >
              <List.Item.Meta
                title={
                  <>
                    <b>{item.guest}</b> <Tag>{item.status}</Tag>
                  </>
                }
                description={`Rooms: ${item.rooms.join(', ')} | From: ${item.from} | To: ${item.to}`}
              />
            </List.Item>
          )}
        />
      </Modal>
      <Suspense fallback={<div>Loading details...</div>}>
        {selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default CalendarView;
