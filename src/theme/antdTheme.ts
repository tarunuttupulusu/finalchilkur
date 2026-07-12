import { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#D35400', // Brand Orange
    colorBgLayout: '#FDF8F5', // Warm Cream brand canvas tone
    colorBgContainer: '#FFFFFF', // Pure White for components
    colorTextBase: '#2A2A2A', // Charcoal text
    borderRadius: 6, // Crispunified modern micro-borders
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: '#D35400',
      colorPrimaryHover: '#E67E22',
      colorPrimaryActive: '#A04000',
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 700,
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#F5E6E3',
      borderRadius: 6,
    },
    Table: {
      headerBg: '#4A2E2B', // Sider/Header Chocolate-Charcoal
      headerColor: '#FDF8F5',
      borderRadius: 6,
    },
    Card: {
      borderRadius: 12,
    },
    Menu: {
      itemBg: '#4A2E2B',
      itemSelectedBg: '#D35400',
      itemColor: '#FAF6EE',
      itemSelectedColor: '#FFFFFF',
    }
  }
};

export default antdTheme;
