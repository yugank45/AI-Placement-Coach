import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { progressApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

export default function ProgressPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', readiness: 0, interviews: 0, applications: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: points = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.list,
  });

  const addMutation = useMutation({
    mutationFn: progressApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setShowForm(false);
      setForm({ date: '', readiness: 0, interviews: 0, applications: 0 });
      toast({ title: 'Progress recorded' });
    },
    onError: () => toast({ title: 'Could not save progress', variant: 'destructive' }),
  });

  const latest = points[points.length - 1];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
            <p className="text-muted-foreground mt-1">Visualize your readiness and application momentum over time.</p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4 mr-2" /> Record Progress
          </Button>
        </div>

        {/* Stat summary */}
        {latest && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Readiness', value: `${latest.readiness}%`, color: 'text-primary' },
              { label: 'Interviews', value: latest.interviews, color: 'text-blue-500' },
              { label: 'Applications', value: latest.applications, color: 'text-emerald-500' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="py-5 flex flex-col items-center">
                  <span className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
                  <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add entry form */}
        {showForm && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Log a progress checkpoint</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Label *</label>
                  <input
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    placeholder="Nov"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                {(['readiness', 'interviews', 'applications'] as const).map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium capitalize block mb-1.5">{field}</label>
                    <input
                      type="number"
                      min={0}
                      max={field === 'readiness' ? 100 : undefined}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))}
              </div>
              <Button
                className="mt-4"
                disabled={!form.date || addMutation.isPending}
                onClick={() => addMutation.mutate(form)}
              >
                {addMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : 'Save'}
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && points.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-20 flex flex-col items-center text-muted-foreground text-center">
              <TrendingUp className="w-10 h-10 mb-4 opacity-30" />
              <p className="font-medium text-lg">No progress data yet</p>
              <p className="text-sm mt-1">Use the "Record Progress" button above to log your first checkpoint.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && points.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Readiness Trend</CardTitle>
                <CardDescription>Your aggregated score over time based on mock performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                      <Area type="monotone" dataKey="readiness" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorReadiness)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Volume</CardTitle>
                <CardDescription>Applications sent vs Mock Interviews completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="applications" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Applications" />
                      <Line type="monotone" dataKey="interviews"   stroke="hsl(var(--primary))"   strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Interviews" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
