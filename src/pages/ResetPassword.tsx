import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: 'Invalid Link',
        description: 'The reset password link is invalid or missing a token.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, toast]);

  // Validate password match
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else if (formData.password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
      } else {
        setPasswordError('');
      }
    } else if (formData.confirmPassword && !formData.password) {
      setPasswordError('Please enter password first');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid reset token. Please request a new password reset link.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      setIsSuccess(true);
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to reset password. The link may have expired. Please request a new one.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            <img 
              src="/soccer-scouting-logo.jpeg" 
              alt="Soccer Scouting Academy Reality Show" 
              className="max-w-[200px] h-auto"
            />
            <h1 className="text-4xl font-bold text-primary-foreground">
              Soccer Scouting Academy Reality Show
            </h1>
          </div>
          
          <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm max-w-sm">
            <Lock className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary-foreground mb-2">
              Reset Password
            </h2>
            <p className="text-primary-foreground/70">
              Create a new secure password to regain access to your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-8">
            <img 
              src="/soccer-scouting-logo.jpeg" 
              alt="Soccer Scouting Academy Reality Show" 
              className="max-w-[120px] h-auto"
            />
            <h1 className="text-2xl font-bold text-foreground">Soccer Scouting Academy Reality Show</h1>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              {isSuccess ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-success/10">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">Password Reset Successful</CardTitle>
                  <CardDescription className="text-center">
                    Your password has been reset successfully. Redirecting to login...
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
                  <CardDescription className="text-center">
                    Enter your new password below
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="space-y-4">
                  <Link to="/login" className="block">
                    <Button className="w-full h-11">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-11"
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`h-11 ${passwordError ? 'border-destructive' : ''}`}
                      required
                    />
                    {passwordError && (
                      <div className="flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    {!passwordError && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-success">Passwords match</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-primary hover:bg-primary/90"
                    disabled={isLoading || !!passwordError}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Button>
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a href="mailto:support@soccerscoutingacademy.com" className="text-accent hover:underline">
              support@soccerscoutingacademy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
