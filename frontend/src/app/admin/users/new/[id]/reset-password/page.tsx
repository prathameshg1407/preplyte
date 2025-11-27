// src/app/admin/users/[id]/reset-password/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUsers } from '../../../../../../lib/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { ArrowLeft, Loader2, Eye, EyeOff, Copy, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { resetPassword } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('newPassword', password);
    setValue('confirmPassword', password);
    setShowPassword(true);
  };

  const copyPassword = () => {
    const password = watch('newPassword');
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword(id, data.newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto">
        <Card className="border-border">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mx-auto mb-4">
              <Check className="h-5 w-5" />
            </div>
            <h2 className="font-semibold mb-1">Password Reset</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The password has been successfully updated.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/users/${id}`}>View User</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/admin/users">All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/admin/users/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Set a new password</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-border">
        <CardContent className="pt-6">
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 border border-border rounded-lg bg-secondary/50">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  placeholder="••••••••"
                  className="h-10 pr-20"
                />
                <div className="absolute right-1 top-1 flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-muted-foreground">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="h-10"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-muted-foreground">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Generate Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={generatePassword}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Random Password
            </Button>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}