import React, { lazy, Suspense } from 'react';
import { Row, Col, Card, Table, Select } from 'antd';
import {
  HomeOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  PercentageOutlined,
  ToolOutlined,
  MessageOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
// Extend dayjs with necessary plugins
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
import './index.css';
import useHostelStore, { Reservation } from '../../store/hostelStore';
import useConfigStore from '../../store/config';

const CalendarView = lazy(() => import('./calendarView'));

const HotelDashboard: React.FC = () => {
  // Dashboard metrics
  const rooms = useHostelStore(state => state.rooms);
  const reservations = useHostelStore(state => state.reservations) as Reservation[];
  const requests = useHostelStore(state => state.requests);
  const today = dayjs().format('YYYY-MM-DD');
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const vacantRooms = rooms.filter(r => r.status === 'Available').length;
  const todayCheckIns = reservations.filter(r => r.from === today).length;
  const todayCheckOuts = reservations.filter(r => r.to === today).length;
  const pendingRequests = requests.length;
  const avgOccupancyRate = `${((occupiedRooms / rooms.length) * 100).toFixed(0)}%`;
  const upcomingMaintenance = rooms.filter(r => r.status === 'Maintenance').length;
  const guestFeedbackCount = 5;
  const stats = [
    { title: 'Occupied Rooms', value: occupiedRooms, icon: <HomeOutlined /> },
    { title: 'Vacant Rooms', value: vacantRooms, icon: <UnlockOutlined /> },
    { title: "Today's Check-ins", value: todayCheckIns, icon: <LoginOutlined /> },
    { title: "Today's Check-outs", value: todayCheckOuts, icon: <LogoutOutlined /> },
    { title: 'Pending Requests', value: pendingRequests, icon: <ClockCircleOutlined /> },
    { title: 'Avg Occupancy Rate', value: avgOccupancyRate, icon: <PercentageOutlined /> },
    { title: 'Upcoming Maintenance', value: upcomingMaintenance, icon: <ToolOutlined /> },
    { title: 'Guest Feedback', value: guestFeedbackCount, icon: <MessageOutlined /> },
  ];

  // Customer Activity data remains unchanged
  const [range, setRange] = React.useState<string>('thisWeek');
  const [granularity, setGranularity] = React.useState<'day' | 'week' | 'month' | 'year'>('day');

  // Theme detection for chart styling
  const themeConfig = useConfigStore(state => state.themeConfig);
  const isDark = themeConfig._algorithm.includes('dark');
  // Helper to compute period boundaries
  const now = dayjs();
  const getPeriod = (key: string) => {
    switch (key) {
      case 'thisWeek': return { start: now.startOf('week'), end: now };
      case 'thisMonth': return { start: now.startOf('month'), end: now };
      case 'last30Days': return { start: now.subtract(29, 'day'), end: now };
      case 'thisQuarter': {
        const qm = Math.floor(now.month() / 3) * 3;
        return { start: now.month(qm).startOf('month'), end: now };
      }
      case 'ytd': return { start: now.startOf('year'), end: now };
      default: return { start: now.subtract(9, 'day'), end: now };
    }
  };
  // Generate data for selected range and granularity
  const { start, end } = getPeriod(range);
  let activityData: Array<{ date: string; value: number }> = [];
  let xField = 'date';
  if (granularity === 'day') {
    const days = end.diff(start, 'day') + 1;
    activityData = Array.from({ length: days }).map((_, i) => ({
      date: start.add(i, 'day').format('YYYY-MM-DD'),
      value: Math.floor(Math.random() * 50) + 10,
    }));
  } else if (granularity === 'week') {
    const weeks = end.diff(start, 'week') + 1;
    activityData = Array.from({ length: weeks }).map((_, i) => {
      const ws = start.add(i, 'week').startOf('week');
      return { date: `${ws.year()}-W${String(ws.week()).padStart(2, '0')}`, value: Math.floor(Math.random() * 300) + 50 };
    });
  } else if (granularity === 'month') {
    const months = end.diff(start, 'month') + 1;
    activityData = Array.from({ length: months }).map((_, i) => {
      const ms = start.add(i, 'month').startOf('month');
      return { date: ms.format('YYYY-MM'), value: Math.floor(Math.random() * 1000) + 200 };
    });
  } else if (granularity === 'year') {
    const years = end.diff(start, 'year') + 1;
    activityData = Array.from({ length: years }).map((_, i) => {
      const ys = start.add(i, 'year').startOf('year');
      return { date: ys.format('YYYY'), value: Math.floor(Math.random() * 5000) + 1000 };
    });
  }
  // Chart configuration
  const activityConfig = {
    data: activityData,
    xField,
    yField: 'value',
    xAxis: { label: { style: { fill: isDark ? '#fff' : '#222' } } },
    yAxis: { label: { style: { fill: isDark ? '#fff' : '#222' } } },
    smooth: true,
    height: 300,
    color: isDark ? '#2f54eb' : '#1677ff',
    tooltip: { domStyles: { 'g2-tooltip': { background: isDark ? '#222' : '#fff' } } },
    point: { size: 5, shape: 'circle' },
  };

  // Get recent reservations from store
  const reservationData = useHostelStore(state => state.reservations) as Reservation[];

  // Room-wise reservations table columns
  const reservationColumns = [
    { title: 'Rooms', dataIndex: 'rooms', key: 'rooms', render: (rooms: number[]) => rooms.join(', ') },
    { title: 'Guest', dataIndex: 'guest', key: 'guest' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
  ];

  return (
    <div>
      <h2>Hotel Dashboard</h2>
      {/* Top Metrics Cards */}
      <Row gutter={[16, 16]} wrap>
        {stats.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.title}>
            <Card>
              <Card.Meta
                avatar={item.icon}
                title={item.title}
                description={<span className="stat-value">{item.value}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-section-controls">
          <div className="range-select">
            <Select
              value={range}
              onChange={setRange}
              options={[
                { value: 'thisWeek', label: 'This Week' },
                { value: 'thisMonth', label: 'This Month' },
                { value: 'last30Days', label: 'Last 30 Days' },
                { value: 'thisQuarter', label: 'This Quarter' },
                { value: 'ytd', label: 'Year to Date' },
              ]}
              style={{ minWidth: 140 }}
            />
          </div>
          <div className="granularity-select">
            <Select
              value={granularity}
              onChange={setGranularity}
              options={[
                { value: 'day', label: 'Daily' },
                { value: 'week', label: 'Weekly' },
                { value: 'month', label: 'Monthly' },
                { value: 'year', label: 'Yearly' },
              ]}
              style={{ minWidth: 120 }}
            />
          </div>
        </div>
        <h3>Customer Activity (Last 10 Days)</h3>
        <Line {...activityConfig} />
      </div>

      {/* Recent Reservations */}
      <div className="room-section">
        <h2>Recent Reservations</h2>
        <Table
          columns={reservationColumns}
          dataSource={reservationData.slice(0, 5)}
          rowKey={r => r.rooms.join(', ') + r.guest}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
};

export {
  CalendarView,
};

export default function HostelIndex() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelDashboard />
    </Suspense>
  );
}
