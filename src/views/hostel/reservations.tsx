import React, { useState } from 'react';
import { Table, Tag, Tabs, Button, message, Modal, Select, Form, DatePicker, Input } from 'antd';
import { CheckOutlined, CloseOutlined, CloseCircleOutlined, LogoutOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import useHostelStore from '../../store/hostelStore';
import type { Reservation, ReservationRequest, Room } from '../../store/hostelStore';
import { apiRequest } from '../../utils/api-client';

// Available rooms from store
const useRooms = () => useHostelStore(state => state.rooms);

const ReservationsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ReservationRequest | null>(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const reservationData = useHostelStore(state => state.reservations);
  const requestData = useHostelStore(state => state.requests);
  const acceptRequest = useHostelStore(state => state.acceptRequest);
  const rejectRequest = useHostelStore(state => state.rejectRequest);
  const addRequest = useHostelStore(state => state.addRequest);
  const editRequest = useHostelStore(state => state.editRequest);
  const checkIn = useHostelStore(state => state.checkInReservation);
  const checkOut = useHostelStore(state => state.checkOutReservation);
  const cancelRes = useHostelStore(state => state.cancelReservation);
  const rooms = useRooms();
  // Determine allocation options: same type first, then higher types, then lower types
  const roomTypeOrder = ['Standard', 'Deluxe', 'Executive'];
  const allocationRooms = React.useMemo(() => {
    const reqType = currentRequest?.roomType;
    if (!reqType) return [] as Room[];
    const idx = roomTypeOrder.indexOf(reqType);
    // same type
    let candidates = rooms.filter(r => r.type === reqType && (r.status === 'Available' || r.status === 'On-Hold'));
    if (candidates.length) return candidates;
    // higher types
    const higher = roomTypeOrder.slice(idx + 1);
    candidates = rooms.filter(r => higher.includes(r.type) && (r.status === 'Available' || r.status === 'On-Hold'));
    if (candidates.length) return candidates;
    // lower types
    const lower = roomTypeOrder.slice(0, idx);
    candidates = rooms.filter(r => lower.includes(r.type) && (r.status === 'Available' || r.status === 'On-Hold'));
    return candidates;
  }, [rooms, currentRequest]);

  // Handlers for Add Request modal
  const showAddModal = () => {
    addForm.resetFields();
    setIsAddModalVisible(true);
  };
  const handleAdd = () => {
    addForm.validateFields().then(values => {
      addRequest({
        name: values.name,
        email: values.email,
        phone: values.phone,
        referrer: values.referrer,
        roomsRequired: values.roomsRequired,
        roomType: values.roomType,
        from: values.from.format('YYYY-MM-DD'),
        to: values.to.format('YYYY-MM-DD')
      });
      message.success('Reservation request added');
      setIsAddModalVisible(false);
    });
  };

  const onAcceptClick = (req: ReservationRequest) => {
    setCurrentRequest(req);
    form.setFieldsValue({ rooms: undefined });
    setIsModalVisible(true);
  };

  // Accept reservation request (API call)
  const handleAccept = async () => {
    form.validateFields().then(async values => {
      if (currentRequest) {
        try {
          await apiRequest('/booking/confirm-booking', {
            method: 'POST',
            body: {
              booking_id: currentRequest.id,
              status: 'accept',
              rooms: values.rooms.map((roomNumber: number) => {
                const room = rooms.find(r => r.number === roomNumber);
                return room ? { id: room.key, room_number: room.number, type: room.type } : null;
              }).filter(Boolean),
              reason: 'Approved',
              status_reason: 'Approved'
            }
          }, true);
          acceptRequest(currentRequest.id, values.rooms);
          message.success('Request accepted');
        } catch (e: any) {
          message.error('Failed to accept request: ' + e.message);
        }
      }
      setIsModalVisible(false);
    });
  };

  // Reject reservation request (API call)
  const handleReject = async (req: ReservationRequest) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (!reason) return;
    try {
      await apiRequest('/booking/confirm-booking', {
        method: 'POST',
        body: {
          booking_id: req.id,
          status: 'reject',
          rooms: [],
          reason,
          status_reason: reason
        }
      }, true);
      rejectRequest(req.id);
      message.success('Request rejected');
    } catch (e: any) {
      message.error('Failed to reject request: ' + e.message);
    }
  };

  // Check-In (API call)
  const handleCheckIn = async (record: Reservation) => {
    try {
      await apiRequest('/booking/booking-action', {
        method: 'POST',
        body: { booking_id: record.id, action: 'check-in' }
      }, true);
      record.rooms.forEach(room => checkIn(room, record.guest));
      message.success('Checked in');
    } catch (e: any) {
      message.error('Failed to check in: ' + e.message);
    }
  };

  // Check-Out (API call)
  const handleCheckOut = async (record: Reservation) => {
    try {
      await apiRequest('/booking/booking-action', {
        method: 'POST',
        body: { booking_id: record.id, action: 'check-out' }
      }, true);
      record.rooms.forEach(room => checkOut(room, record.guest));
      message.success('Checked out');
    } catch (e: any) {
      message.error('Failed to check out: ' + e.message);
    }
  };

  // Handlers for Edit Request
  const onEditClick = (req: ReservationRequest) => {
    setCurrentRequest(req);
    editForm.setFieldsValue({
      name: req.name,
      email: req.email,
      phone: req.phone,
      referrer: req.referrer,
      roomType: req.roomType,
      roomsRequired: req.roomsRequired,
      from: dayjs(req.from),
      to: dayjs(req.to),
    });
    setIsEditModalVisible(true);
  };
  const handleEdit = () => {
    editForm.validateFields().then(values => {
      if (currentRequest) {
        editRequest(currentRequest.id, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          referrer: values.referrer,
          roomType: values.roomType,
          roomsRequired: values.roomsRequired,
          from: values.from.format('YYYY-MM-DD'),
          to: values.to.format('YYYY-MM-DD'),
        });
        message.success('Request updated');
      }
      setIsEditModalVisible(false);
    });
  };

  const columns: ColumnsType<Reservation> = [
    { title: 'Count', key: 'count', render: (_, record) => record.rooms.length },
    { title: 'Rooms', dataIndex: 'rooms', key: 'rooms', render: (rooms: number[]) => rooms.join(', ') },
    { title: 'Guest', dataIndex: 'guest', key: 'guest' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: status => {
        let color = 'blue';
        if (status === 'Checked-In') color = 'green';
        if (status === 'Cancelled') color = 'red';
        if (status === 'Reserved') color = 'gold';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Action', key: 'action', render: (_, record) => {
        if (record.status === 'Reserved') {
          return (
            <>
              <Button icon={<CheckOutlined />} type="link" onClick={() => handleCheckIn(record)}>Check-In</Button>
              <Button icon={<CloseCircleOutlined />} type="link" danger onClick={async () => {
                const reason = window.prompt('Cancellation reason:');
                if (reason) {
                  try {
                    await apiRequest('/booking/booking-action', {
                      method: 'POST',
                      body: { booking_id: record.id, action: 'cancel', reason }
                    }, true);
                    record.rooms.forEach(room => cancelRes(room, record.guest, reason));
                    message.success('Booking cancelled');
                  } catch (e: any) {
                    message.error('Failed to cancel booking: ' + e.message);
                  }
                }
              }}>Cancel</Button>
            </>
          );
        }
        if (record.status === 'Checked-In') {
          return (
            <Button icon={<LogoutOutlined />} type="link" onClick={() => handleCheckOut(record)}>Check-Out</Button>
          );
        }
        return null;
      }
    }
  ];

  const requestColumns: ColumnsType<ReservationRequest> = [
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Requested Type', dataIndex: 'roomType', key: 'roomType' },
    { title: 'Rooms Required', dataIndex: 'roomsRequired', key: 'roomsRequired' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Referrer', dataIndex: 'referrer', key: 'referrer' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    {
      title: 'Action', key: 'action', render: (_, record) => (
        <>
          <Button icon={<CheckOutlined />} type="link" onClick={() => onAcceptClick(record)}>Accept</Button>
          <Button icon={<EditOutlined />} type="link" onClick={() => onEditClick(record)}>Edit</Button>
          <Button icon={<CloseOutlined />} type="link" danger onClick={() => handleReject(record)}>Reject</Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Reservations</h2>
      <Tabs defaultActiveKey="dashboard">
        <Tabs.TabPane tab="Dashboard" key="dashboard">
          <Table
            columns={columns}
            dataSource={reservationData}
            rowKey={r => r.rooms.join('-') + r.guest}
            size="small"
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Requests" key="requests">
          <Button icon={<PlusOutlined />} type="primary" style={{ marginBottom: 16 }} onClick={showAddModal}>Add Request</Button>
          <Table
            columns={requestColumns}
            dataSource={requestData}
            rowKey="id"
            size="small"
          />
          {/* Allocate Room Modal */}
          <Modal
            title={`Allocate Room for ${currentRequest?.name}`}
            open={isModalVisible}
            onOk={handleAccept}
            onCancel={() => setIsModalVisible(false)}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="rooms"
                label="Select Rooms"
                help={`Select exactly ${currentRequest?.roomsRequired} rooms`}
                rules={[
                  { required: true, message: 'Please select rooms' },
                  {
                    validator: (_, value: number[]) =>
                      value && value.length === currentRequest?.roomsRequired
                        ? Promise.resolve()
                        : Promise.reject(new Error(`Select exactly ${currentRequest?.roomsRequired} rooms`)),
                  },
                ]}
              >
                <Select mode="multiple" placeholder="Select rooms" maxCount={currentRequest?.roomsRequired}>
                  {allocationRooms.map(r => (
                    <Select.Option key={r.number} value={r.number}>{r.number} ({r.type})</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
          {/* Add Request Modal */}
          <Modal
            title="New Reservation Request"
            open={isAddModalVisible}
            onOk={handleAdd}
            onCancel={() => setIsAddModalVisible(false)}
          >
            <Form form={addForm} layout="vertical">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="referrer" label="Referrer" rules={[{ required: true }]}>
                <Select defaultActiveFirstOption defaultValue="Staff">
                  <Select.Option value="Staff">Staff</Select.Option>
                  <Select.Option value="Faculty">Faculty</Select.Option>
                  <Select.Option value="Alumni">Alumni</Select.Option>
                  <Select.Option value="Student">Student</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="roomType" label="Room Type" rules={[{ required: true }]}>
                <Select defaultActiveFirstOption defaultValue={"Deluxe"}>
                  {Array.from(new Set(rooms.map(r => r.type))).filter(type => roomTypeOrder.includes(type)).map(type => (
                    <Select.Option key={type} value={type}>{type}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="roomsRequired" label="Rooms Required" rules={[{ required: true, message: 'Please enter the number of rooms' }]}>
                <Input type="number" min={1} defaultValue={1}/>
              </Form.Item>
              <Form.Item name="from" label="From" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="to" label="To" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
            </Form>
          </Modal>
          {/* Edit Request Modal */}
          <Modal
            title="Edit Reservation Request"
            open={isEditModalVisible}
            onOk={handleEdit}
            onCancel={() => setIsEditModalVisible(false)}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="referrer" label="Referrer" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="Staff">Staff</Select.Option>
                  <Select.Option value="Faculty">Faculty</Select.Option>
                  <Select.Option value="Alumni">Alumni</Select.Option>
                  <Select.Option value="Student">Student</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="roomType" label="Room Type" rules={[{ required: true }]}>
                <Select>
                  {Array.from(new Set(rooms.map(r => r.type))).filter(type => roomTypeOrder.includes(type)).map(type => (
                    <Select.Option key={type} value={type}>{type}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="roomsRequired" label="Rooms Required" rules={[{ required: true }]}>
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item name="from" label="From" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item name="to" label="To" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
            </Form>
          </Modal>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ReservationsPage;
