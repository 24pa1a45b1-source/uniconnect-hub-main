import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Briefcase, Mail, Lock, ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, resetPassword, migrateLocalUsersToFirebase } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<Array<{ email?: string; status: string; reason?: string; error?: string }> | null>(null);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !role) {
      toast.error('Please select your role');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        if (showReset) {
          await handlePasswordReset();
        } else {
          const result = await login(email, password);
          if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
          } else {
            toast.error(result.error || 'Login failed');
          }
        }
      } else if (!showReset) {
        const result = await signup(email, password, role!);
        if (result.success) {
          toast.success('Account created! Please complete your profile.');
          navigate('/profile-setup');
        } else {
          toast.error(result.error || 'Signup failed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your college email to reset password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        toast.success('If an account exists, a password reset email has been sent.');
        setShowReset(false);
      } else {
        toast.error(result.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('Unexpected error during password reset', err);
      toast.error('Password reset failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!migrateLocalUsersToFirebase) {
      toast.error('Migration function not available');
      return;
    }
    if (!confirm('Migrate local users to Firebase? This will attempt to create accounts in Firebase using stored passwords and will remove local copies on success.')) return;

    setIsMigrating(true);
    try {
      const result = await migrateLocalUsersToFirebase({ removeLocal: true });
      if (!result.success) {
        toast.error(result.error || result.message || 'Migration failed');
        return;
      }
      const ok = result.migrated ?? 0;
      const total = (result.results || []).length;
      toast.success(`${ok}/${total} users migrated. Check the migration report for details.`);
      console.log('Migration results:', result.results);
      setMigrationResults(result.results || []);
      setShowMigrationModal(true);
    } catch (err) {
      console.error('Migration unexpected error', err);
      toast.error('Migration failed. See console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  const clearLocalUsers = () => {
    if (!confirm('Clear local mock users from this device? This is irreversible.')) return;
    localStorage.removeItem('uniconnect_users');
    localStorage.removeItem('uniconnect_user');
    toast.success('Local users cleared');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-secondary/50 to-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M30%200L60%2030L30%2060L0%2030z%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold gradient-text">UniConnect</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-md">
              Your all-in-one campus platform for events, resources, and community.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Campus Events</h3>
                <p className="text-sm text-muted-foreground">Discover hackathons, freshers parties, and more</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Community Help</h3>
                <p className="text-sm text-muted-foreground">Lost & found, help requests, emergency alerts</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Career Opportunities</h3>
                <p className="text-sm text-muted-foreground">Placements, internships, and achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">UniConnect</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Join UniConnect'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Sign in to continue to your dashboard' : 'Create your account to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      role === 'student'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <span className="font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      role === 'faculty'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Briefcase className="w-6 h-6" />
                    <span className="font-medium">Faculty</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                College Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use your .edu, .edu.in, or .ac.in email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isLogin && !showReset && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {isLogin && showReset && (
              <div className="space-y-2 p-4 rounded-lg bg-secondary/10 border border-border">
                <p className="text-sm text-muted-foreground">Enter your college email and we'll send a password reset link.</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                  <Button
                    type="button"
                    className="flex-0"
                    onClick={() => setShowReset(false)}
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? (showReset ? 'Send reset link' : 'Sign In') : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-medium text-primary">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>

          {import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE === 'true' && (
            <div className="mt-6 p-4 rounded-lg border border-border bg-secondary/5">
              <p className="text-sm text-muted-foreground mb-2">Dev utilities</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={handleMigrate} disabled={isMigrating}>
                  {isMigrating ? 'Migrating…' : 'Migrate local users to Firebase'}
                </Button>
                <Button size="sm" variant="ghost" onClick={clearLocalUsers}>
                  Clear local users
                </Button>
              </div>

              {/* Migration report modal */}
              {showMigrationModal && migrationResults && (
                <div className="mt-4 p-4 rounded-md border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <strong>Migration Report</strong>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const blob = new Blob([JSON.stringify(migrationResults, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'migration-report.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>Download</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowMigrationModal(false); setMigrationResults(null); }}>Close</Button>
                    </div>
                  </div>

                  <div className="max-h-40 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(migrationResults || []).map((r, idx) => (
                          <tr key={idx} className="border-t border-border">
                            <td className="py-2">{r.email || '—'}</td>
                            <td className="py-2">{r.status}</td>
                            <td className="py-2 text-xs text-muted-foreground">{r.reason || r.error || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
