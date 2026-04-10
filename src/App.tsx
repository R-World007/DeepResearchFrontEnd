import { AuthProvider, useAuth } from './lib/auth-context';
import { signInWithGoogle, logout } from './lib/firebase';
import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  History, 
  LayoutDashboard, 
  LogOut, 
  Send, 
  Cpu, 
  Database, 
  Zap, 
  ChevronRight,
  Loader2,
  User as UserIcon,
  BrainCircuit,
  FileText,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from './lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, serverTimestamp } from 'firebase/firestore';
import { simulateResearch, ResearchStepData } from './lib/research-service';
import ReactMarkdown from 'react-markdown';

function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
      setLoginError(message);
      console.error('Google sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <BrainCircuit className="text-white w-10 h-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">G3 Research</CardTitle>
              <CardDescription className="text-base">
                Advanced Deep Research Agent with Memory Constraints
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 text-lg font-medium bg-black hover:bg-zinc-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </Button>
            {loginError && (
              <p className="text-sm text-red-600 text-center leading-6">
                {loginError}
              </p>
            )}
            <p className="text-center text-xs text-zinc-500 mt-4">
              Secure research environment for complex queries
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ResearchInterface() {
  const { user } = useAuth();
  const [queryInput, setQueryInput] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  useEffect(() => {
    if (!activeSession) {
      setSteps([]);
      return;
    }
    const q = query(
      collection(db, 'sessions', activeSession.id, 'steps'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setSteps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const handleStartResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || !user || isResearching) return;

    setIsResearching(true);
    try {
      const sessionDoc = await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        title: queryInput,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      
      const newSession = { id: sessionDoc.id, title: queryInput };
      setActiveSession(newSession);
      setQueryInput('');

      await simulateResearch(queryInput, async (stepData) => {
        await addDoc(collection(db, 'sessions', sessionDoc.id, 'steps'), {
          ...stepData,
          sessionId: sessionDoc.id,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error("Research failed:", error);
    } finally {
      setIsResearching(false);
    }
  };

  const totalTokens = steps.reduce((acc, step) => acc + (step.tokenUsage || 0), 0);
  const totalCost = steps.reduce((acc, step) => acc + (step.cost || 0), 0);

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">G3 Agent</h1>
        </div>

        <div className="px-4 mb-4">
          <Button 
            onClick={() => { setActiveSession(null); setSteps([]); }}
            variant="outline" 
            className="w-full justify-start gap-2 border-zinc-200 hover:bg-zinc-50"
          >
            <Search className="w-4 h-4" />
            New Research
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 py-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">History</p>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group ${
                  activeSession?.id === session.id 
                    ? 'bg-zinc-100 text-black font-medium shadow-sm' 
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Clock className={`w-4 h-4 ${activeSession?.id === session.id ? 'text-black' : 'text-zinc-400'}`} />
                <span className="truncate flex-1">{session.title}</span>
                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeSession?.id === session.id ? 'text-black' : 'text-zinc-400'}`} />
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-8 h-8 border border-white shadow-sm">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-zinc-400 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-zinc-800">
              {activeSession ? activeSession.title : 'New Research Session'}
            </h2>
            {isResearching && (
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 animate-pulse border-none">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1.5 hover:text-black transition-colors">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{totalTokens.toLocaleString()} tokens</span>
                  </TooltipTrigger>
                  <TooltipContent>Total context usage in this session</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Separator orientation="vertical" className="h-4 bg-zinc-200" />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1.5 hover:text-black transition-colors">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>${totalCost.toFixed(4)}</span>
                  </TooltipTrigger>
                  <TooltipContent>Estimated session cost</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Chat/Steps Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              {!activeSession && !steps.length && (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-2">
                    <BrainCircuit className="w-10 h-10 text-zinc-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">How can I help your research?</h3>
                    <p className="text-zinc-500 max-w-md mx-auto">
                      Enter a complex query and I'll break it down, search for sources, and synthesize a deep response.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                    {['Explain quantum computing impact on cryptography', 'Recent breakthroughs in fusion energy', 'History of architectural styles in Tokyo', 'Analyze global supply chain trends 2024'].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => setQueryInput(suggestion)}
                        className="p-3 text-xs text-left border border-zinc-200 rounded-xl hover:bg-white hover:shadow-sm transition-all text-zinc-600"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                        step.type === 'decomposition' ? 'bg-blue-50 text-blue-600' :
                        step.type === 'retrieval' ? 'bg-purple-50 text-purple-600' :
                        step.type === 'reasoning' ? 'bg-amber-50 text-amber-600' :
                        step.type === 'summary' ? 'bg-green-50 text-green-600' :
                        'bg-zinc-50 text-zinc-600'
                      }`}>
                        {step.type === 'decomposition' && <LayoutDashboard className="w-4 h-4" />}
                        {step.type === 'retrieval' && <Database className="w-4 h-4" />}
                        {step.type === 'reasoning' && <Cpu className="w-4 h-4" />}
                        {step.type === 'summary' && <FileText className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {step.type}
                          </span>
                          <span className="text-[10px] text-zinc-300">•</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm group-hover:shadow-md transition-shadow">
                          <div className="prose prose-zinc prose-sm max-w-none">
                            <ReactMarkdown>{step.content}</ReactMarkdown>
                          </div>
                          
                          {step.metadata?.sources && (
                            <div className="mt-4 pt-4 border-t border-zinc-50 flex flex-wrap gap-2">
                              {step.metadata.sources.map((source: string, sIdx: number) => (
                                <Badge key={sIdx} variant="outline" className="bg-zinc-50 text-[10px] font-normal border-zinc-200">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                             <Zap className="w-2.5 h-2.5" /> {step.tokenUsage} tokens
                           </span>
                           <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                             <Database className="w-2.5 h-2.5" /> ${step.cost?.toFixed(5)}
                           </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-8 pt-0">
            <div className="max-w-4xl mx-auto">
              <form 
                onSubmit={handleStartResearch}
                className="relative bg-white rounded-2xl shadow-xl border border-zinc-200 p-2 focus-within:ring-2 focus-within:ring-black/5 transition-all"
              >
                <Input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask a complex research question..."
                  className="border-none shadow-none focus-visible:ring-0 text-base h-12 pr-14"
                  disabled={isResearching}
                />
                <Button 
                  type="submit"
                  size="icon"
                  disabled={!queryInput.trim() || isResearching}
                  className="absolute right-3 top-3 h-10 w-10 bg-black hover:bg-zinc-800 rounded-xl transition-all"
                >
                  {isResearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-center text-zinc-400 mt-3">
                G3 Research Agent • Memory Constraints Active (2K Context) • Powered by Gemini
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return user ? <ResearchInterface /> : <LoginPage />;
}
