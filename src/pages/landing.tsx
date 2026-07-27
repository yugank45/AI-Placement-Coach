import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-border/50 flex items-center px-6 md:px-12 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary tracking-tight flex-1">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono text-lg">AI</div>
          Placement Coach
        </div>
        <nav className="hidden md:flex items-center gap-6 mr-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">Methodology</a>
        </nav>
        <Link href="/dashboard" className="inline-block">
          <Button>Open App <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" /> Prep smarter, not harder.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Stop guessing if you are <span className="text-primary">ready for placement.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Your personal, brutal, and brilliantly effective AI coach for final-year placements. Resume audits, technical mock interviews, and curated jobs—all optimized to get you hired.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base h-14 px-8 rounded-xl">
                Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 rounded-xl bg-transparent">
              View Demo
            </Button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-card border-y border-border py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The ultimate placement weapon</h2>
              <p className="text-muted-foreground">Every tool you need to confidently clear ATS screens and ace technical rounds.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">ATS-Proof Resume</h3>
                <p className="text-muted-foreground">Upload your resume and get an instant gap analysis against your target role. Know what skills you are missing before recruiters do.</p>
              </div>
              <div className="p-8 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Hostile Mock Interviews</h3>
                <p className="text-muted-foreground">Face realistic, role-specific technical questions. Get scored instantly on accuracy, depth, and communication.</p>
              </div>
              <div className="p-8 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">High-Fit Jobs Only</h3>
                <p className="text-muted-foreground">Stop mass applying. See only the roles where your skill profile matches over 80% of the requirements.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border mt-auto">
        AI Placement Coach &copy; 2024. Built for ambitious engineers.
      </footer>
    </div>
  );
}
