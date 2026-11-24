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
        'workspace-surface w-64 gap-3 rounded-2xl px-4 py-3.5 ring-0',
        (selected || isActive) &&
          'outline-workspace-accent/80 outline-2 outline-offset-1',
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AppIcon name={icon} badge className="size-8 rounded-lg" />
        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px]">{kind}</p>
          <p className="truncate font-semibold">{label}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
