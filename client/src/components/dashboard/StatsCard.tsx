import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  loading?: boolean;
}

const StatsCard = ({ title, value, change, icon: Icon, loading = false }: StatsCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2"></div>
          <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {change.type === 'increase' ? '+' : '-'}{change.value}
            </span>
            {change.type === 'increase' ? ' increase' : ' decrease'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
