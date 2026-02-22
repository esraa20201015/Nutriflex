import CustomIndicator from '@/components/shared/CustomIndicator'
import { useTraineeDashboard } from './hooks/useTraineeDashboard'
import OverviewCard from './components/OverviewCard'
import ProgressChart from './components/ProgressChart';
import TodayFocus from './components/TodayFocus';
import StatusCard from './components/StatusCard';

export default function TraineeDashboardPage() {
  const { dashboard, overview, progress, today, status, loading } = useTraineeDashboard();

  if (loading) return <CustomIndicator />;

  return (
    <div className="dashboard grid gap-6 p-4">
      {overview && <OverviewCard data={overview} />}
      {progress && <ProgressChart data={progress} />}
      {today && <TodayFocus data={today} />}
      {status && <StatusCard data={status} />}
    </div>
  );
}
