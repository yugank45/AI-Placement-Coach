import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi, resumeApi, interviewsApi, jobsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, MonitorPlay, Briefcase, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { profile: cachedProfile } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    initialData: cachedProfile ?? undefined,
  });

  const { data: resume } = useQuery({
    queryKey: ['resume'],
    queryFn: resumeApi.get,
    retry: false, // 404 means no resume yet — don't retry
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  const readinessScore  = profile?.readinessScore ?? 0;
  const firstName       = profile?.name?.split(' ')[0] ?? '…';
  const targetRole      = profile?.targetRole ?? 'your target role';

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgScore = completedInterviews.length
    ? Math.round(completedInterviews.reduce((s, i) => s + (i.score ?? 0), 0) / completedInterviews.length)
    : null;

  const activeJobs        = jobs.filter(j => j.status !== 'saved');
  const advancedJobs      = jobs.filter(j => j.status === 'interviewing' || j.status === 'offer');
  const readinessColor    = readinessScore > 75 ? 'text-emerald-500' : readinessScore > 50 ? 'text-amber-500' : 'text-destructive';

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          {profile ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {firstName}</h1>
              <p className="text-muted-foreground">Your target is <strong className="text-foreground">{targetRole}</strong>. Here is where you stand today.</p>
            </>
          ) : (
            <>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </>
          )}
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-primary text-primary-foreground border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TargetIcon className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-primary-foreground/80 font-medium text-sm">Overall Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-6xl font-bold font-mono tracking-tighter">{readinessScore}</span>
                    <span className="text-xl mb-1 opacity-80">/ 100</span>
                  </div>
                  <Progress value={readinessScore} className="h-2 bg-primary-foreground/20" indicatorClassName="bg-white" />
                  <p className="mt-3 text-sm opacity-90">Keep completing mock interviews to raise your score.</p>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-14 w-36 bg-primary-foreground/20" />
                  <Skeleton className="h-2 w-full bg-primary-foreground/20" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col justify-center">
            <CardHeader>
              <CardTitle>Next Recommended Actions</CardTitle>
              <CardDescription>Based on your current progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <MonitorPlay className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Practice System Design</p>
                      <p className="text-xs text-muted-foreground">Your lowest scoring area in the last mock</p>
                    </div>
                  </div>
                  <Link href="/interview"><Button size="sm" variant="secondary">Start Session</Button></Link>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Review High-Fit Jobs</p>
                      <p className="text-xs text-muted-foreground">{jobs.filter(j => j.fitScore >= 80).length} roles matching your profile</p>
                    </div>
                  </div>
                  <Link href="/jobs"><Button size="sm" variant="secondary">View Jobs</Button></Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resume */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Resume Status</CardTitle>
                <CardDescription>{resume ? 'Analysis complete' : 'Not yet analyzed'}</CardDescription>
              </div>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-col gap-2">
                {resume ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ATS Score</span>
                      <span className={`font-bold font-mono ${resume.atsScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{resume.atsScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Identified Gaps</span>
                      <span className="font-bold text-amber-600">{resume.gaps.length} Skills</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Upload your resume to get started.</p>
                )}
                <Link href="/resume" className="mt-4">
                  <Button variant="outline" className="w-full text-sm">
                    {resume ? 'Update Resume' : 'Analyze Resume'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>
                  {avgScore != null ? `Avg Score: ${avgScore}%` : 'No completed sessions yet'}
                </CardDescription>
              </div>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary">
                <MonitorPlay className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-col gap-3">
                {completedInterviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed sessions yet. Start one to see your score.</p>
                ) : (
                  completedInterviews.slice(0, 2).map(int => (
                    <div key={int.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="truncate pr-4 text-muted-foreground">{int.date}</span>
                      <span className="font-bold font-mono">{int.score}%</span>
                    </div>
                  ))
                )}
                <Link href="/interview" className="mt-2">
                  <Button variant="outline" className="w-full text-sm">View Feedback <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Active Applications</CardTitle>
                <CardDescription>Currently tracking {activeJobs.length} role{activeJobs.length !== 1 ? 's' : ''}</CardDescription>
              </div>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-col gap-3">
                {advancedJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active interviews or offers yet.</p>
                ) : (
                  advancedJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="truncate font-medium">{job.company}</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">{job.status}</span>
                    </div>
                  ))
                )}
                <Link href="/jobs" className="mt-2">
                  <Button variant="outline" className="w-full text-sm">Job Tracker <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
