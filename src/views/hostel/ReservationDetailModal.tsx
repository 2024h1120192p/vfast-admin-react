import React from 'react';
import { Modal, Button, Tag } from 'antd';
import type { Reservation } from '../../store/hostelStore';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({ reservation, onClose }) => (
  <Modal
    open={!!reservation}
    title="Reservation Details"
    onCancel={onClose}
    footer={<Button onClick={onClose}>Close</Button>}
  >
    {reservation && (
      <div>
        <p><b>Guest:</b> {reservation.guest}</p>
        <p><b>Rooms:</b> {reservation.rooms.join(', ')}</p>
        <p><b>From:</b> {reservation.from}</p>
        <p><b>To:</b> {reservation.to}</p>
        <p><b>Status:</b> <Tag>{reservation.status}</Tag></p>
        {reservation.cancellationReason && (
          <p><b>Cancellation Reason:</b> {reservation.cancellationReason}</p>
        )}
      </div>
    )}
  </Modal>
);

export default ReservationDetailModal;
