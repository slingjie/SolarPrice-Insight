import React from 'react';
import { TimeConfig } from '../../types';
import { recordLog } from '../../services/logService';
import { TimeConfigView } from '../TimeConfig';

interface TimeConfigsManagerProps {
  configs: TimeConfig[];
  onUpdateConfigs: (newConfigs: TimeConfig[]) => void;
}

export const TimeConfigsManager: React.FC<TimeConfigsManagerProps> = ({ configs, onUpdateConfigs }) => {
  const handleSave = (nextConfigs: TimeConfig[]) => {
    const prevCount = configs.length;
    const nextCount = nextConfigs.length;

    onUpdateConfigs(nextConfigs);

    if (nextCount > prevCount) {
      recordLog('time_configs', 'create', nextCount - prevCount);
      return;
    }

    if (nextCount < prevCount) {
      recordLog('time_configs', 'delete', prevCount - nextCount);
      return;
    }

    recordLog('time_configs', 'update', Math.max(1, nextCount));
  };

  return <TimeConfigView configs={configs} onSave={handleSave} />;
};
