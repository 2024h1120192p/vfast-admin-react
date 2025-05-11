import { Layout, Switch, Button, message } from 'antd';
import useConfigStore from '../../store/config';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './headerbar.css';
const { Header } = Layout;

const Headerbar = (props: { colorBgContainer: string }) => {
  const setAlgorithm = useConfigStore(state => state.setAlgorithm)
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    message.info('Logged out');
    navigate('/login');
  }

  return (
    <Header title="React Admin Dashboard" style={{ padding: 0, background: props.colorBgContainer }}>
      <div className="headerbar-container">
        <h2>VFAST Admin</h2>
        <div className="headerbar-right">
          <Switch checkedChildren="Light" unCheckedChildren="Dark" defaultChecked onChange={(checked) => setAlgorithm(checked ? 'default' : 'dark')} />
          <p className="username">{username}</p>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />
        </div>
      </div>
    </Header>
  );
}

export default Headerbar
