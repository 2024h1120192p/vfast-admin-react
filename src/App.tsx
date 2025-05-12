import React from 'react';
import PageLayout from './components/layout';
import { ConfigProvider, App as AntdApp } from 'antd';
import useConfigStore from './store/config';
import { useNavigate } from 'react-router-dom';
import useHostelSyncStore from './store/useHostelSyncStore';

const App: React.FC = () => {
  useHostelSyncStore(); // Start syncing hostel data
  const theme = useConfigStore(state => state.themeConfig)
  const navigate = useNavigate()

  // TODO: refactor this logic
  if (window.location.pathname === '/admin/') {
    setTimeout(() => {
      navigate('/dashboard')
    });
  }

  return (
    <AntdApp>
      <ConfigProvider theme={{
        algorithm: theme.algorithm,
        token: {
          colorPrimary: theme.primaryColor
        }
      }}>
        <PageLayout />
      </ConfigProvider>
    </AntdApp>
  )
};

export default App;
