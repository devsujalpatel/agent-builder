import {
  Airplane01Icon,
  CloudIcon,
  GitPullRequestIcon,
  Message01Icon,
  PencilEdit02Icon,
  Search01Icon,
  SourceCodeIcon,
  ArrowRight01Icon,
  BotIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { AgentTemplate } from '@/modules/agents/lib/templates';

const defaultAppearance = {
  icon: BotIcon,
  color: 'bg-muted text-foreground',
};

const appearances: Record<string, typeof defaultAppearance> = {
  weather: {
    icon: CloudIcon,
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
  },
  'web-research': {
    icon: Search01Icon,
    color:
      'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200',
  },
  travel: {
    icon: Airplane01Icon,
    color:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
  },
  writing: {
    icon: PencilEdit02Icon,
    color:
      'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  },
  coding: {
    icon: SourceCodeIcon,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-200',
  },
  'pr-review': {
    icon: GitPullRequestIcon,
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200',
  },
};

type TemplateCardProps = {
  template: AgentTemplate;
  disabled: boolean;
  isCreating: boolean;
  onCreate: () => void;
};

export function TemplateCard({
  template,
  disabled,
  isCreating,
  onCreate,
}: TemplateCardProps) {
  const { icon, color } = appearances[template.id] ?? defaultAppearance;
  const example = template.starterPrompts[0];

  return (
    <Card className="workspace-surface rounded-3xl ring-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="gap-1.5">
        <span
          className={cn(
            'mb-2 flex size-10 items-center justify-center rounded-xl',
            color,
          )}
        >
          <HugeiconsIcon icon={icon} className="size-5" aria-hidden="true" />
        </span>
        <CardTitle>
          <h3>{template.name}</h3>
        </CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      {example && (
        <CardContent>
          <div className="bg-muted/70 text-muted-foreground flex items-start gap-2 rounded-2xl px-3 py-2.5 text-xs leading-relaxed">
            <HugeiconsIcon
              icon={Message01Icon}
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <p className="wrap-anywhere">“{example}”</p>
          </div>
        </CardContent>
      )}
      <CardFooter className="mt-auto justify-end rounded-b-3xl bg-transparent py-3">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3 motion-reduce:transition-none"
          aria-label={
            isCreating
              ? `Creating ${template.name}`
              : `Use template: ${template.name}`
          }
          onClick={onCreate}
          disabled={disabled}
        >
          {isCreating ? 'Creating…' : 'Use template'}
          {isCreating ? (
            <Spinner
              data-icon="inline-end"
              aria-hidden="true"
              className="motion-reduce:animate-none"
            />
          ) : (
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              aria-hidden="true"
            />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
