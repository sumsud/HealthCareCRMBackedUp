import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { TimelineEvent } from '@shared/types';
import { MoreHorizontal, FileText, MessageSquare, Calendar, CreditCard, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import apiService from '@/lib/api';

interface ActivityFeedProps {
  limit?: number;
  showViewAll?: boolean;
}

const ActivityFeed = ({ limit = 5, showViewAll = true }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<TimelineEvent[]>('/activities', { limit });
        setActivities(response);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'note':
        return <FileText className="h-3 w-3" />;
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      case 'appointment':
        return <Calendar className="h-3 w-3" />;
      case 'payment':
        return <CreditCard className="h-3 w-3" />;
      case 'patient':
        return <User className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-muted">
                <Skeleton className="absolute left-0 top-1 h-6 w-6 rounded-full" />
                <div className="grid gap-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-center text-muted-foreground">
            Failed to load activities. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-center text-muted-foreground">
            No recent activity found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="space-y-8">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-muted"
            >
              <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-50">
                {getActivityIcon(activity.category)}
              </span>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  <span dangerouslySetInnerHTML={{ __html: activity.title }} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {showViewAll && (
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
