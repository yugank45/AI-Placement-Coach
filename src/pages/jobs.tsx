import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { jobsApi, JobStatus, CreateJobInput } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Globe, Building2, Briefcase, BookmarkPlus, Check, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_LABELS: Record<JobStatus, string> = {
  saved: 'Saved', applied: 'Applied', interviewing: 'Interviewing', offer: 'Offer',
};

export default function JobsPage() {
  const [activeTab, setActiveTab]   = useState('recommended');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<CreateJobInput>({ company: '', role: '', location: '', fitScore: 50 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const addMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setShowAddForm(false);
      setForm({ company: '', role: '', location: '', fitScore: 50 });
      toast({ title: 'Job added to tracker' });
    },
    onError: () => toast({ title: 'Could not add job', variant: 'destructive' }),
  });

  const recommended = [...jobs].filter(j => j.fitScore >= 75).sort((a, b) => b.fitScore - a.fitScore);
  const getByStatus = (s: JobStatus) => jobs.filter(j => j.status === s);

  const cycleStatus = (id: string, current: JobStatus) => {
    const order: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    statusMutation.mutate({ id, status: next });
  };

  const JobCard = ({ job }: { job: typeof jobs[0] }) => (
    <Card className="hover:border-primary/50 transition-colors bg-background">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xl text-muted-foreground shrink-0">
              {job.company.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">{job.role}</h3>
              <div className="flex items-center text-muted-foreground text-sm gap-1">
                <Building2 className="w-3.5 h-3.5" /> {job.company}
              </div>
            </div>
          </div>
          <Badge variant={job.fitScore > 85 ? 'success' : 'secondary'} className="shrink-0 font-mono">
            {job.fitScore}% Fit
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
          {job.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</div>}
          {job.remote && <div className="flex items-center gap-1"><Globe className="w-4 h-4" /> Remote</div>}
          {job.salary && <div className="flex items-center gap-1 text-foreground font-medium"><Briefcase className="w-4 h-4" /> {job.salary}</div>}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            variant={job.status === 'applied' ? 'secondary' : 'default'}
            onClick={() => cycleStatus(job.id, job.status)}
            disabled={statusMutation.isPending}
          >
            {job.status === 'applied'
              ? <><Check className="w-4 h-4 mr-2" /> Applied</>
              : job.status === 'saved' ? 'Quick Apply' : STATUS_LABELS[job.status]}
          </Button>
          <Button
            variant="outline" size="icon"
            onClick={() => statusMutation.mutate({ id: job.id, status: job.status === 'saved' ? 'applied' : 'saved' })}
            disabled={statusMutation.isPending}
          >
            <BookmarkPlus className={`w-4 h-4 ${job.status === 'saved' ? 'fill-current text-primary' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Recommendations</h1>
            <p className="text-muted-foreground mt-1">High-fit roles curated based on your verified skills.</p>
          </div>
          <Button variant="outline" onClick={() => setShowAddForm(v => !v)}>
            {showAddForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Add Job</>}
          </Button>
        </div>

        {/* Add Job inline form */}
        {showAddForm && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Add a new job to your tracker</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['company', 'role', 'location'] as const).map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium capitalize block mb-1.5">{field}{field !== 'location' ? ' *' : ''}</label>
                    <input
                      value={(form[field] as string) ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={field === 'company' ? 'Razorpay' : field === 'role' ? 'Frontend Engineer' : 'Bengaluru / Remote'}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Fit Score (0–100)</label>
                  <input
                    type="number" min={0} max={100}
                    value={form.fitScore ?? 50}
                    onChange={e => setForm(f => ({ ...f, fitScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                disabled={!form.company || !form.role || addMutation.isPending}
                onClick={() => addMutation.mutate(form)}
              >
                {addMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : 'Add to Tracker'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="recommended">Recommended For You</TabsTrigger>
            <TabsTrigger value="tracker">Application Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="space-y-6">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
              </div>
            )}
            {!isLoading && recommended.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-16 flex flex-col items-center text-muted-foreground text-center">
                  <Briefcase className="w-8 h-8 mb-3 opacity-40" />
                  <p className="font-medium">No high-fit jobs yet</p>
                  <p className="text-sm">Add jobs with a fit score ≥ 75% to see them here.</p>
                </CardContent>
              </Card>
            )}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracker">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pb-8">
                {(['saved', 'applied', 'interviewing', 'offer'] as JobStatus[]).map(status => (
                  <div key={status} className="bg-muted/40 rounded-xl p-4 border border-border min-h-[400px]">
                    <h3 className="font-semibold capitalize mb-4 flex items-center justify-between text-sm">
                      {STATUS_LABELS[status]}
                      <Badge variant="neutral">{getByStatus(status).length}</Badge>
                    </h3>
                    <div className="space-y-3">
                      {getByStatus(status).map(job => (
                        <Card
                          key={job.id}
                          className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                          onClick={() => cycleStatus(job.id, job.status)}
                        >
                          <CardContent className="p-3">
                            <p className="font-bold text-sm leading-tight mb-1">{job.company}</p>
                            <p className="text-xs text-muted-foreground truncate mb-2">{job.role}</p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-tight">
                              {job.fitScore}% Fit
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                      {getByStatus(status).length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                          No jobs here yet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
