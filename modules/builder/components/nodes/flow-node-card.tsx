import type { ReactNode } from 'react';

import { AppIcon } from '@/components/app-icon';
import { Card } from '@/components/ui/card';
import type { IconName } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/modules/builder/store/canvas-store';

export function FlowNodeCard({
  id,
  selected,
  kind,
  label,
  icon,
  children,
}: {
  id: string;
  selected: boolean;
  kind: string;
  label: string;
  icon: IconName;
  children: ReactNode;
}) {
  const isActive = useCanvasStore((state) => state.selectedNodeId === id);

  return (
    <Card
      className={cn(
        'w-64 gap-3 rounded-xl border px-4 py-3.5 shadow-sm ring-0',
        (selected || isActive) &&
          'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400',
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AppIcon name={icon} badge className="size-8 rounded-lg" />
        <div className="min-w-0">
          <p className="text-muted-foreground font-mono text-[10px] tracking-wide uppercase">
            {kind}
          </p>
          <p className="truncate font-medium">{label}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
