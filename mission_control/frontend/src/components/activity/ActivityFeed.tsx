import React, { useEffect, useState } from 'react';
import { Bot, Clock } from 'lucide-react';
import { Markdown } from '@/components/atoms/Markdown';

export type ActivityItem = {
  id: string;
  agent: string;
  action: string;
  message: string;
  created_at: string;
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = sessionStorage.getItem('mc_local_auth_token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setActivities(data.items || []);
      } catch (e) {
        console.error('Activity fetch failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
    // Poll every 10 seconds for new activity
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Waiting for activity…</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Your agents will log actions here in real-time once they are triggered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group animate-fade-in-up"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 capitalize">{item.agent}</h4>
                  <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md uppercase tracking-widest">
                    {item.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed">
                <Markdown content={item.message} variant="basic" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
