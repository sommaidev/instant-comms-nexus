
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { getCurrentEnvironment, getEnvironmentDisplayName, isProduction } from '@/config/env';

export function EnvironmentBadge() {
  const envName = getEnvironmentDisplayName();
  
  // Don't show anything in production
  if (isProduction()) {
    return null;
  }

  // Get appropriate color based on environment
  const getVariant = () => {
    const env = getCurrentEnvironment();
    switch (env) {
      case 'local':
        return 'outline';
      case 'dev':
        return 'secondary';
      case 'uat':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant()} className="text-xs">
      {envName}
    </Badge>
  );
}
