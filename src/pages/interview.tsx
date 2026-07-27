import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { interviewsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic, Square, Play, CheckCircle2, ChevronRight, Video, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Rotating question bank — simulates a curated set of questions
const QUESTIONS = [
  { q: 'Explain the virtual DOM and how React\'s reconciliation works under the hood. Specifically, what happens when a component\'s state changes?', role: 'Frontend Engineer', difficulty: 'Medium' },
  { q: 'How would you optimize a React app that renders 10,000 list items? Walk me through every technique you\'d use.', role: 'Frontend Engineer', difficulty: 'Hard' },
  { q: 'Explain closures in JavaScript with a real-world example where they caused you a bug and how you fixed it.', role: 'Frontend Engineer', difficulty: 'Medium' },
  { q: 'Design the front-end architecture for a real-time collaborative document editor like Google Docs.', role: 'Frontend Engineer', difficulty: 'Hard' },
  { q: 'What is the event loop? How does it interact with microtasks and macrotasks in Node.js?', role: 'Fullstack Engineer', difficulty: 'Medium' },
];

const FEEDBACK_POOL = [
  { score: 85, well: 'Great explanation of the diffing algorithm (O(n) complexity heuristics). Good clear voice and structured approach.', improve: 'You missed mentioning React Fiber (introduced in React 16) and how it enables interruptible rendering. This is critical for Senior/Mid roles.' },
  { score: 72, well: 'Good coverage of memoization techniques and React.memo. Clear reasoning throughout.', improve: 'Missing discussion of virtualization libraries like react-window. Also should have mentioned Suspense + lazy loading for code splitting.' },
  { score: 91, well: 'Outstanding depth on closures and lexical scope. The real-world debugging example was excellent.', improve: 'Could have touched on WeakRefs and how they interact with garbage collection — shows senior-level awareness.' },
  { score: 68, well: 'Solid architectural instinct — you identified WebSockets early and proposed a good conflict-resolution model.', improve: 'The CRDT (Conflict-Free Replicated Data Types) concept was missing. Interviewers at top companies often probe for this in collaborative app designs.' },
  { score: 79, well: 'Clear and correct explanation of the event loop phases. Good use of examples.', improve: 'Didn\'t mention the difference between Promise.then (microtask) and setTimeout (macrotask) clearly enough. This is a common trap question.' },
];

export default function MockInterview() {
  const [sessionState, setSessionState] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [timer, setTimer] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [feedbackIdx, setFeedbackIdx] = useState(() => Math.floor(Math.random() * FEEDBACK_POOL.length));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentQ = QUESTIONS[questionIdx];
  const currentF = FEEDBACK_POOL[feedbackIdx];

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'recording') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewsApi.list,
  });

  const saveMutation = useMutation({
    mutationFn: interviewsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Session saved', description: 'Your interview session has been recorded.' });
    },
    onError: () => {
      toast({ title: 'Save failed', description: 'Could not save the session. Your score was still displayed.', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: interviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Session deleted' });
    },
  });

  const handleStart = () => setSessionState('recording');

  const handleStop = () => {
    setSessionState('processing');
    // Simulate AI processing then save to backend
    setTimeout(() => {
      setSessionState('result');
      const today = new Date().toISOString().split('T')[0];
      saveMutation.mutate({
        date: today,
        role: currentQ.role,
        question: currentQ.q,
        score: currentF.score,
        feedback: `What you did well: ${currentF.well} | Improve: ${currentF.improve}`,
        status: 'completed',
      });
    }, 3000);
  };

  const handleReset = () => {
    setSessionState('idle');
    // Pick new question + feedback for next session
    setQuestionIdx(Math.floor(Math.random() * QUESTIONS.length));
    setFeedbackIdx(Math.floor(Math.random() * FEEDBACK_POOL.length));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">Practice realistic technical questions under pressure and save your results.</p>
        </div>

        {sessionState !== 'idle' ? (
          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden relative">
            {sessionState === 'recording' && (
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                </span>
                <span className="text-sm font-mono font-medium text-destructive">{formatTime(timer)}</span>
              </div>
            )}

            <CardHeader className="bg-muted/30 border-b border-border pb-8">
              <Badge variant="outline" className="w-fit mb-4">
                {currentQ.role} • {currentQ.difficulty} Difficulty
              </Badge>
              <CardTitle className="text-2xl leading-relaxed">"{currentQ.q}"</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {sessionState === 'recording' && (
                <div className="h-64 flex flex-col items-center justify-center bg-background">
                  <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 animate-pulse">
                    <Mic className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-medium">Recording your response…</p>
                  <p className="text-sm text-muted-foreground">Speak clearly. Press stop when finished.</p>
                </div>
              )}

              {sessionState === 'processing' && (
                <div className="h-64 flex flex-col items-center justify-center bg-background">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium">Analyzing response…</p>
                  <p className="text-sm text-muted-foreground">Evaluating accuracy, depth, and communication.</p>
                </div>
              )}

              {sessionState === 'result' && (
                <div className="p-8 bg-background">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0 flex flex-col items-center p-6 bg-card border border-border rounded-xl min-w-[200px]">
                      <span className="text-sm text-muted-foreground mb-2">Score</span>
                      <span className={`text-6xl font-bold font-mono mb-2 ${currentF.score >= 80 ? 'text-emerald-500' : currentF.score >= 65 ? 'text-amber-500' : 'text-destructive'}`}>
                        {currentF.score}
                      </span>
                      <Badge variant={currentF.score >= 80 ? 'success' : 'warning'}>
                        {currentF.score >= 80 ? 'Strong Pass' : currentF.score >= 65 ? 'Pass' : 'Needs Work'}
                      </Badge>
                      {saveMutation.isPending && (
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                        </p>
                      )}
                      {saveMutation.isSuccess && (
                        <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Saved
                        </p>
                      )}
                    </div>
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What you did well
                        </h3>
                        <p className="text-muted-foreground">{currentF.well}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-amber-500" /> Areas to improve
                        </h3>
                        <p className="text-muted-foreground">{currentF.improve}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-muted/30 border-t border-border p-6 flex justify-between">
              {sessionState === 'recording' && (
                <Button variant="destructive" size="lg" onClick={handleStop} className="mx-auto w-48">
                  <Square className="w-5 h-5 mr-2" /> Stop Recording
                </Button>
              )}
              {sessionState === 'result' && (
                <>
                  <Button variant="outline" onClick={handleReset}>Close</Button>
                  <Button onClick={handleReset}>
                    Next Question <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-primary text-primary-foreground border-none flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Start New Session</CardTitle>
                <CardDescription className="text-primary-foreground/80 text-base">
                  Ready to test your skills? Your answer is evaluated and saved automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90" onClick={handleStart}>
                  Start Interview <Play className="w-4 h-4 ml-2 fill-current" />
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Past Sessions</h3>
                {completedSessions.length > 0 && (
                  <Badge variant="secondary">{completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}</Badge>
                )}
              </div>

              {isLoading && Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}

              {!isLoading && completedSessions.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 flex flex-col items-center text-center text-muted-foreground">
                    <MonitorPlay className="w-8 h-8 mb-3 opacity-40" />
                    <p className="font-medium">No sessions yet</p>
                    <p className="text-sm">Start your first mock interview above.</p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && completedSessions.map(session => (
                <Card key={session.id} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 font-bold font-mono text-xl ${
                      (session.score ?? 0) >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {session.score ?? '–'}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{session.role}</span>
                        <span className="text-xs text-muted-foreground">• {session.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{session.question}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(session.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function MonitorPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polygon points="10,8 16,12 10,16 10,8" fill="currentColor" stroke="none" />
    </svg>
  );
}
