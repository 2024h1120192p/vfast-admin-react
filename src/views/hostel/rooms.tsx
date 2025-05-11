import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Form, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MoreOutlined } from '@ant-design/icons';
import useHostelStore from '../../store/hostelStore';
import type { Room } from '../../store/hostelStore';

// Static room type categories
const roomTypes = ['Standard', 'Deluxe', 'Executive'];

const RoomsPage: React.FC = () => {
  const roomData = useHostelStore(state => state.rooms);
  const updateRoomStatus = useHostelStore(state => state.updateRoomStatus);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Handler for changing room status
  const handleStatusChange = (room: Room) => {
    setCurrentRoom(room);
    form.setFieldsValue({
      status: room.status
    });
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleOk = () => {
    form.validateFields().then(values => {
      const { status } = values;
      if (currentRoom) {
        // Update via central store
        updateRoomStatus(currentRoom.number, status, null);
        message.success(`Room ${currentRoom.number} status updated to ${status}`);
      }
      setIsModalVisible(false);
    });
  };

  // Occupancy table columns
  const occupancyColumns: ColumnsType<Room> = [
    { title: 'Room #', dataIndex: 'number', key: 'number', width: '25%' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: '25%',
      render: (status) => {
        let color = 'green';
        if (status === 'Occupied') color = 'red';
        if (status === 'Maintenance') color = 'grey';
        if (status === 'On-Hold') color = 'darkorange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: 'Guest', dataIndex: 'guest', key: 'guest', width: '30%',
      render: (guest: string|null) => guest || '-' },
    {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        record.status !== 'Occupied' ? (
          <Button 
            icon={<MoreOutlined />}
            onClick={() => handleStatusChange(record)} 
            type="text"
          >
            Change Status
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <h2>Rooms</h2>
      <div>
        {roomTypes.map(type => (
          <div key={type} className="room-type-section table-uniform-container">
            <h3 className="room-type-title">{type} Rooms</h3>
            <div className="table-uniform-wrapper">
              <Table
                columns={occupancyColumns}
                dataSource={roomData.filter(r => r.type === type)}
                rowKey={r => r.key}
                pagination={false}
                size="small"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Status Change Modal */}
      <Modal 
        title={`Update Room ${currentRoom?.number}`} 
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form 
          form={form}
          layout="vertical"
        >
          <Form.Item 
            name="status" 
            label="Room Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value="Available">Available</Select.Option>
              <Select.Option value="Maintenance">Maintenance</Select.Option>
              <Select.Option value="On-Hold">On-Hold</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsPage;
