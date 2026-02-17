import { useState, useEffect } from 'react';
import {
  apiGetTraineeDashboard,
  apiGetTraineeOverview,
  apiGetTraineeDashboardProgress,
  apiGetTraineeToday,
  apiGetTraineeStatus
} from '@/services/TraineeService';
import type {
  TraineeDashboardMainData,
  TraineeOverviewData,
  TraineeProgressData,
  TraineeTodayData,
  TraineeStatusData
} from '@/@types/api';

export const useTraineeDashboard = () => {
  const [dashboard, setDashboard] = useState<TraineeDashboardMainData | null>(null);
  const [overview, setOverview] = useState<TraineeOverviewData | null>(null);
  const [progress, setProgress] = useState<TraineeProgressData | null>(null);
  const [today, setToday] = useState<TraineeTodayData | null>(null);
  const [status, setStatus] = useState<TraineeStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dash, ov, prog, td, st] = await Promise.all([
          apiGetTraineeDashboard(),
          apiGetTraineeOverview(),
          apiGetTraineeDashboardProgress(),
          apiGetTraineeToday(),
          apiGetTraineeStatus(),
        ]);
        setDashboard(dash.data);
        setOverview(ov.data);
        setProgress(prog.data);
        setToday(td.data);
        setStatus(st.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { dashboard, overview, progress, today, status, loading };
};
