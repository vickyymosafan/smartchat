'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * EnvCheck Component
 * Display environment variables status untuk debugging
 * Hanya tampil di development atau saat user klik debug button
 */
export function EnvCheck() {
  const [showDebug, setShowDebug] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const nodeEnv = process.env.NODE_ENV;

  const checks = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: supabaseUrl,
      required: true,
      preview: supabaseUrl,
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: supabaseKey,
      required: true,
      preview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : undefined,
    },
    {
      name: 'NEXT_PUBLIC_APP_URL',
      value: appUrl,
      required: false,
      preview: appUrl,
    },
    {
      name: 'NODE_ENV',
      value: nodeEnv,
      required: true,
      preview: nodeEnv,
    },
  ];

  const allRequired = checks.filter(c => c.required).every(c => c.value);
  const hasIssues = checks.some(c => c.required && !c.value);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Debug Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Environment Variables</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowKeys(!showKeys)}
              variant="ghost"
              size="icon-sm"
              title={showKeys ? 'Hide values' : 'Show values'}
            >
              {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowDebug(false)}
              variant="ghost"
              size="icon-sm"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <div
          className={`mb-3 flex items-center gap-2 rounded-lg border p-2 text-sm ${
            allRequired
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
          }`}
        >
          {allRequired ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">All required variables set</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Missing required variables!</span>
            </>
          )}
        </div>

        {/* Variable List */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-2 rounded border p-2 text-xs"
            >
              <div className="mt-0.5">
                {check.value ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                ) : check.required ? (
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono font-medium">{check.name}</div>
                {check.value ? (
                  <div className="mt-1 truncate text-muted-foreground">
                    {showKeys ? check.value : check.preview}
                  </div>
                ) : (
                  <div className="mt-1 text-red-600">
                    {check.required ? 'MISSING (Required)' : 'Not set (Optional)'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        {hasIssues && (
          <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
            <div className="font-medium mb-1">⚠️ Action Required:</div>
            <div className="space-y-1">
              <div>1. Go to Vercel Dashboard</div>
              <div>2. Settings → Environment Variables</div>
              <div>3. Add missing variables</div>
              <div>4. Redeploy application</div>
            </div>
            <div className="mt-2 text-[10px]">
              See VERCEL_DEPLOYMENT_GUIDE.md for details
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="mt-3 pt-3 border-t text-[10px] text-muted-foreground">
          <div>Environment: {nodeEnv || 'unknown'}</div>
          <div>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
        </div>
      </Card>
    </div>
  );
}
