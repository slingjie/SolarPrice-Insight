import React, { useEffect } from 'react';

export const SelfConsumption: React.FC = () => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">光伏消纳分析</h1>
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-600">
          此页面将用于光伏消纳分析功能。刷新页面将触发数据丢失警告。
        </p>
      </div>
    </div>
  );
};
