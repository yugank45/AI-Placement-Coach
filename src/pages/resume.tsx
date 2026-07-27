import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { resumeApi, skillsApi, ApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResumeAnalyzer() {
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['resume'],
    queryFn: resumeApi.get,
    retry: (count, err) => !(err instanceof ApiError && err.status === 404),
  });

  const { data: skills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsApi.list,
  });

  const upsertMutation = useMutation({
    mutationFn: resumeApi.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      toast({ title: 'Resume analyzed', description: 'Your ATS score and skill gaps have been updated.' });
    },
    onError: () => {
      toast({ title: 'Analysis failed', description: 'Could not save the analysis. Please try again.', variant: 'destructive' });
    },
  });

  // Simulates the "upload + AI analysis" UX, then persists a result
  const handleUpload = () => {
    setIsSimulating(true);
    setTimeout(async () => {
      await upsertMutation.mutateAsync({
        atsScore: Math.floor(Math.random() * 15) + 68, // 68-82 range
        extractedSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'C++'],
        gaps: [
          { skill: 'TypeScript',       reason: 'Most modern frontend roles require strict typing.' },
          { skill: 'State Management', reason: 'Missing Redux or Zustand experience for complex apps.' },
          { skill: 'Testing',          reason: 'No mention of Jest or Cypress, critical for robust frontend engineering.' },
        ],
        recommendedCourses: [
          { title: 'Advanced React & TypeScript',  url: 'https://www.typescriptlang.org/docs/', duration: '4 hours' },
          { title: 'Frontend Testing Masterclass', url: 'https://jestjs.io/docs/getting-started',  duration: '6 hours' },
        ],
        fileName: 'resume_v2.pdf',
      });
      setIsSimulating(false);
    }, 2500);
  };

  const showUploader = !loadingAnalysis && !analysis && !isSimulating;
  const showAnalysis = analysis && !isSimulating;

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
          <p className="text-muted-foreground mt-1">Audit your resume against ATS filters and your target role's exact requirements.</p>
        </div>

        {/* Loading state */}
        {loadingAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        )}

        {/* Upload / simulate state */}
        {(showUploader || isSimulating) && (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                {isSimulating
                  ? <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  : <UploadCloud className="w-10 h-10 text-primary" />}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {isSimulating ? 'Analyzing Resume…' : 'Upload your latest resume'}
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                {isSimulating
                  ? 'Extracting skills, computing ATS compatibility, and identifying gaps.'
                  : 'PDF or DOCX format. We\'ll instantly score it and tell you what\'s missing.'}
              </p>
              <Button size="lg" onClick={handleUpload} disabled={isSimulating} className="w-48">
                {isSimulating ? 'Processing…' : 'Select File'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis results */}
        {showAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ATS Compatibility</CardTitle>
                  <CardDescription>Target: {analysis.fileName ?? 'Your resume'}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" fill="transparent" stroke="var(--color-muted)" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="60" fill="transparent"
                        stroke="var(--color-primary)" strokeWidth="8"
                        strokeDasharray="377"
                        strokeDashoffset={377 - (377 * analysis.atsScore) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold font-mono tracking-tighter">{analysis.atsScore}</span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <Badge variant={analysis.atsScore > 70 ? 'success' : 'warning'} className="mb-2">
                    {analysis.atsScore > 70 ? 'Good Fit' : 'Needs Work'}
                  </Badge>
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    {analysis.atsScore > 70
                      ? 'Your resume passes ATS filters but has some gaps to close.'
                      : 'Your resume needs work before it clears most ATS systems.'}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t border-border flex justify-center py-4">
                  <Button variant="outline" size="sm" onClick={handleUpload} disabled={isSimulating} className="w-full">
                    <UploadCloud className="w-4 h-4 mr-2" /> Re-analyze / Upload New
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Extracted Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.extractedSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Critical Skill Gaps
                  </CardTitle>
                  <CardDescription>Missing or underrepresented skills for your target role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.gaps.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm text-muted-foreground">No critical gaps detected — great job!</p>
                    </div>
                  ) : (
                    analysis.gaps.map((gap, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                        <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{gap.skill}</h4>
                          <p className="text-sm text-muted-foreground">{gap.reason}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" /> Recommended Path
                  </CardTitle>
                  <CardDescription>Curated resources to close your skill gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendedCourses.map((course, i) => (
                      <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">{course.title}</h4>
                            <p className="text-xs text-muted-foreground">{course.duration} • High Priority</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill comparison from /skills */}
              {skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Level Comparison</CardTitle>
                    <CardDescription>Current vs required levels for your target role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {loadingSkills
                      ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                      : skills.slice(0, 4).map(skill => (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-muted-foreground text-xs font-mono">
                              {skill.currentLevel}/{skill.requiredLevel} Required
                            </span>
                          </div>
                          <div className="relative h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
                              style={{ left: `${(skill.requiredLevel / 10) * 100}%` }}
                            />
                            <div
                              className={`h-full ${skill.currentLevel >= skill.requiredLevel ? 'bg-emerald-500' : 'bg-primary'}`}
                              style={{ width: `${(skill.currentLevel / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
