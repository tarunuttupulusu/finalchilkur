"use client";

import React from 'react';
import { ConfigProvider } from 'antd';
import antdTheme from '@/theme/antdTheme';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}
