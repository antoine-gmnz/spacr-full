import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { HttpError } from '@/lib/http';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const [form, setForm] = useState({ password: '', passwordConfirmation: '' });
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.passwordConfirmation) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        email,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      });
      toast.success('Password reset! You can now sign in.');
      navigate('/login');
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        toast.error('This reset link is invalid or has expired.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-muted-foreground">This reset link is missing required parameters.</p>
            <Link to="/forgot-password" className="underline text-sm">
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="new-password"
                minLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm new password</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={form.passwordConfirmation}
                onChange={set('passwordConfirmation')}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
