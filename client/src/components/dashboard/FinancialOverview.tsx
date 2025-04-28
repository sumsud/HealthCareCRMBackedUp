import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw } from 'lucide-react';
import { RootState } from '@/store';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface FinancialOverviewProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (start: Date, end: Date) => void;
}

interface FinancialData {
  name: string;
  revenue: number;
  expenses: number;
}

const FinancialOverview = ({ 
  startDate, 
  endDate, 
  onDateRangeChange 
}: FinancialOverviewProps) => {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const stats = useSelector((state: RootState) => state.billing.stats);

  useEffect(() => {
    // Simulate API call for financial data
    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        // This would be an actual API call in production
        // const data = await apiService.get('/billing/financial-overview', { 
        //   startDate, endDate 
        // });
        
        // For demo purposes, using mock data
        const mockData: FinancialData[] = [
          { name: 'Jan', revenue: 35000, expenses: 29000 },
          { name: 'Feb', revenue: 38000, expenses: 30000 },
          { name: 'Mar', revenue: 32000, expenses: 27000 },
          { name: 'Apr', revenue: 42000, expenses: 32000 },
          { name: 'May', revenue: 45000, expenses: 34000 },
          { name: 'Jun', revenue: 50000, expenses: 36000 },
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setFinancialData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch financial data', error);
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-lg font-medium">Financial Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Skeleton className="h-80 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <CardTitle className="text-lg font-medium">Financial Overview</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-muted"></div>
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-background/50 p-3 rounded-md border">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-background/50 p-3 rounded-md border">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="bg-background/50 p-3 rounded-md border">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.overdue)}</p>
            </div>
            <div className="bg-background/50 p-3 rounded-md border">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.paid)}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value / 1000}k`} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`${formatCurrency(value)}`, undefined]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
              <Bar 
                dataKey="expenses" 
                fill="hsl(var(--muted))" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverview;
