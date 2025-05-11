import React, { useState } from 'react';
import { Table, Modal, Form, Select, Button, message, Tabs } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useHostelStore from '../../store/hostelStore';
import type { Customer } from '../../store/hostelStore';
import type { Reservation } from '../../store/hostelStore';

const CustomersPage: React.FC = () => {
  // Use store
  const customerData = useHostelStore(state => state.customers);
  const reservationData = useHostelStore(state => state.reservations) as Reservation[];
  const shiftCustomerRoom = useHostelStore(state => state.shiftCustomerRoom);
  const allRooms = useHostelStore(state => state.rooms);
  // Room type order for luxury
  const roomTypeOrder = ['Standard', 'Deluxe', 'Executive'];
  // Split active and past customers
  const activeCustomers = customerData.filter(c =>
    reservationData.some(r => r.guest === c.name && (r.status === 'Reserved' || r.status === 'CheckedIn'))
  );
  const pastCustomers = customerData.filter(c => !activeCustomers.includes(c));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // Find current customer's room type
  const getCurrentCustomerRoomType = () => {
    if (!currentCustomer) return undefined;
    const currentRoom = allRooms.find(r => r.number === currentCustomer.room);
    return currentRoom?.type;
  };
  const currentRoomType = getCurrentCustomerRoomType();
  // Only allow shifting to rooms that are Available/On-Hold and same or higher luxury
  const roomNumbers = allRooms.filter(r => {
    if (!currentRoomType) return false;
    const currentIdx = roomTypeOrder.indexOf(currentRoomType);
    const targetIdx = roomTypeOrder.indexOf(r.type);
    return (r.status === 'Available' || r.status === 'On-Hold') && targetIdx >= currentIdx;
  }).map(r => r.number);

  // Find if revert is possible for current customer
  const canRevert = currentCustomer?.canRevert && currentCustomer.previousRoom &&
    allRooms.find(r => r.number === currentCustomer.previousRoom && (r.status === 'Available' || r.status === 'On-Hold'));

  const columns: ColumnsType<Customer> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Rooms', key: 'rooms', render: (_: any, record: Customer) => {
        // Show all rooms ever assigned to this customer
        const resList = reservationData.filter(r => r.guest === record.name);
        const allRooms = Array.from(new Set(resList.flatMap(r => r.rooms)));
        return allRooms.length ? allRooms.join(', ') : record.room.toString();
      }
    },
    {
      title: 'Action', key: 'action', render: (_, record) => (
        <Button
          icon={<MoreOutlined />}
          type="text"
          onClick={() => handleShift(record)}
        >
          Shift Room
        </Button>
      ),
    },
  ];

  // Columns without action for past customers, with Reservation Id
  const pastColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Rooms', key: 'rooms', render: (_: any, record: Customer) => {
        const resList = reservationData.filter(r => r.guest === record.name);
        const allRooms = Array.from(new Set(resList.flatMap(r => r.rooms)));
        return allRooms.length ? allRooms.join(', ') : record.room.toString();
      }
    },
    {
      title: 'Reservation ID',
      dataIndex: 'reservationId',
      key: 'reservationId',
      render: (_: any, record: Customer) => {
        const res = reservationData
          .filter(r => r.guest === record.name && (r.status === 'CheckedOut' || r.status === 'Cancelled'))
          .sort((a, b) => (a.from < b.from ? 1 : -1))[0];
        return res ? res.id : '-';
      }
    },
  ];

  // Handler to open modal for shifting room
  const handleShift = (customer: Customer) => {
    setCurrentCustomer(customer);
    form.setFieldsValue({ room: customer.room });
    setIsModalVisible(true);
  };

  // Handle modal OK and update customer room
  const handleOk = () => {
    form.validateFields().then(values => {
      if (currentCustomer) {
        shiftCustomerRoom(currentCustomer.key, values.room as number);
        message.success(`${currentCustomer.name} shifted to room ${values.room}`);
      }
      setIsModalVisible(false);
    });
  };

  return (
    <div>
      <h2>Customers</h2>
      <Tabs defaultActiveKey="active">
        <Tabs.TabPane tab="Active Customers" key="active">
          <Table columns={columns} dataSource={activeCustomers} rowKey="key" pagination={false} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Past Customers" key="past">
          <Table columns={pastColumns} dataSource={pastCustomers} rowKey="key" pagination={false} />
        </Tabs.TabPane>
      </Tabs>

      {/* Shift Room Modal */}
      <Modal
        title={`Shift ${currentCustomer?.name}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        footer={(_footerProps) => ([
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Cancel</Button>,
          canRevert && (
            <Button key="revert" type="primary" danger onClick={() => {
              if (currentCustomer?.previousRoom) {
                shiftCustomerRoom(currentCustomer.key, currentCustomer.previousRoom, true);
                message.success(`${currentCustomer.name} reverted to previous room ${currentCustomer.previousRoom}`);
                setIsModalVisible(false);
              }
            }}>Revert to Previous Room</Button>
          ),
          <Button key="ok" type="primary" onClick={handleOk}>OK</Button>
        ].filter(Boolean))}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="room" label="Select Room" rules={[{ required: true }]}>        
            <Select>
              {roomNumbers.map(r => (
                <Select.Option key={r} value={r}>{r}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CustomersPage;
