import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionButtonProps {
  authorId: number;
  currentUserId: number;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showSubscriberCount?: boolean;
}

export function SubscriptionButton({ 
  authorId, 
  currentUserId, 
  variant = "default",
  size = "default",
  showSubscriberCount = false
}: SubscriptionButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already subscribed
  const { data: isSubscribed } = useQuery({
    queryKey: ['/api/subscriptions/check', authorId, currentUserId],
    enabled: currentUserId !== authorId, // Don't check if it's the same user
  });

  // Get subscriber count
  const { data: subscriberCount } = useQuery({
    queryKey: ['/api/subscriptions/count', authorId],
    enabled: showSubscriberCount,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/subscriptions', {
        subscribedToId: authorId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/check', authorId, currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/count', authorId] });
      toast({
        title: "Subscribed!",
        description: "You will now receive updates from this author",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/subscriptions/${authorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/check', authorId, currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/count', authorId] });
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive updates from this author",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unsubscribe failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  // Don't show button if user is viewing their own profile
  if (currentUserId === authorId) {
    return showSubscriberCount ? (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        {subscriberCount || 0} subscribers
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggleSubscription}
        disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
        variant={isSubscribed ? "outline" : variant}
        size={size}
        className={`${isSubscribed ? "border-red-200 text-red-600 hover:bg-red-50" : ""}`}
      >
        {subscribeMutation.isPending || unsubscribeMutation.isPending ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isSubscribed ? (
          <UserMinus className="w-4 h-4 mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
      </Button>
      
      {showSubscriberCount && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {subscriberCount || 0}
        </div>
      )}
    </div>
  );
}