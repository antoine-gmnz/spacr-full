import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { HttpError } from '@/lib/http';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

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
      await register({
        email: form.email,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
        displayName: form.displayName || undefined,
      });
      navigate('/');
    } catch (err) {
      if (err instanceof HttpError && err.status === 422) {
        const body = err.body as { errors?: { message: string }[] } | undefined;
        const msg = body?.errors?.[0]?.message ?? 'Validation error.';
        toast.error(msg);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join Spacr and explore the universe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name (optional)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Astronaut42"
                value={form.displayName}
                onChange={set('displayName')}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              <Label htmlFor="passwordConfirmation">Confirm password</Label>
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
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="underline hover:text-foreground">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
