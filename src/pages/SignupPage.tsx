import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, Store, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const { signup, confirmAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(email, password, shopName);
      toast({
        title: 'Account created!',
        description: 'Please check your email for a confirmation code',
      });
      setStep('confirm');
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await confirmAccount(email, confirmationCode);
      toast({
        title: 'Email confirmed!',
        description: 'You can now sign in to your account',
      });
      setIsLoading(false);
      // Use React Router navigation instead of hard redirect
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error('Confirmation failed:', error);
      toast({
        title: 'Confirmation failed',
        description: error.message || 'Invalid confirmation code',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-sage-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">RetailMind AI</h1>
          </div>
          <p className="text-muted-foreground">
            {step === 'signup' 
              ? 'Create your account to get started'
              : 'Confirm your email address'
            }
          </p>
        </div>

        <div className="premium-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {step === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="shopName"
                    type="text"
                    placeholder="My Retail Store"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation code to<br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Confirmation Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('signup')}
                disabled={isLoading}
              >
                Back to signup
              </Button>
            </form>
          )}

          {step === 'signup' && (
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
