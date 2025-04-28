import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { cn, calculatePercentage } from '@/lib/utils';

interface ComplianceItem {
  name: string;
  percentage: number;
  status: 'success' | 'warning' | 'danger';
}

interface AlertItem {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

interface ComplianceStatusProps {
  complianceItems?: ComplianceItem[];
  alerts?: AlertItem[];
  loading?: boolean;
}

const ComplianceStatus = ({ 
  complianceItems, 
  alerts, 
  loading = false 
}: ComplianceStatusProps) => {
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <CardTitle className="text-lg font-medium">Compliance Status</CardTitle>
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // Default compliance data if none provided
  const defaultComplianceItems: ComplianceItem[] = complianceItems || [
    {
      name: 'HIPAA Compliance',
      percentage: 98,
      status: 'success'
    },
    {
      name: 'Security Audit',
      percentage: 100,
      status: 'success'
    },
    {
      name: 'Staff Training',
      percentage: 82,
      status: 'warning'
    },
    {
      name: 'Documentation',
      percentage: 95,
      status: 'success'
    }
  ];

  // Default alert if none provided
  const defaultAlerts: AlertItem[] = alerts || [
    {
      title: 'Attention Required',
      description: '3 staff members need to complete HIPAA training by July 15.',
      severity: 'warning'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  const getAlertStyles = (severity: string): { bgColor: string, textColor: string, borderColor: string } => {
    switch (severity) {
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950',
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-900'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-900'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-900'
        };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <CardTitle className="text-lg font-medium">Compliance Status</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {defaultComplianceItems.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className={cn(
                  "text-sm font-semibold",
                  item.status === 'success' && "text-green-600",
                  item.status === 'warning' && "text-yellow-600",
                  item.status === 'danger' && "text-red-600"
                )}>
                  {item.percentage}%
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    getStatusColor(item.status)
                  )} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {defaultAlerts.map((alert, index) => {
          const styles = getAlertStyles(alert.severity);
          
          return (
            <div 
              key={index} 
              className={cn(
                "mt-6 rounded-md border p-4",
                styles.bgColor,
                styles.borderColor
              )}
            >
              <div className="flex items-start">
                <AlertTriangle className={cn("h-5 w-5 mr-2", styles.textColor)} />
                <div>
                  <h5 className={cn("text-sm font-medium", styles.textColor)}>
                    {alert.title}
                  </h5>
                  <div className={cn("mt-1 text-xs", styles.textColor)}>
                    {alert.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ComplianceStatus;
