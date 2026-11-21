'use client';

import { AppIcon } from '@/components/app-icon';
import { Card } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { GithubConfig } from '@/modules/workflows/lib/schema';
import { useCanvasStore } from '../store/canvas-store';

const fields = [
  { key: 'owner', label: 'Owner', placeholder: 'octocat' },
  { key: 'repo', label: 'Repository', placeholder: 'Hello-World' },
  {
    key: 'defaultPrNumber',
    label: 'Default pull request (optional)',
    placeholder: '42 or pull request URL',
  },
] as const satisfies readonly {
  key: keyof GithubConfig;
  label: string;
  placeholder: string;
}[];

export function GithubSettings({
  nodeId,
  github,
}: {
  nodeId: string;
  github: GithubConfig;
}) {
  const updateAgentNode = useCanvasStore((state) => state.updateAgentNode);

  return (
    <Card className="gap-4 rounded-xl border p-4 shadow-xs ring-0">
      <div className="flex gap-2.5">
        <AppIcon name="github_read_file" badge className="size-8 rounded-lg" />
        <div className="space-y-1">
          <h3 className="text-sm font-medium">GitHub repository defaults</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Set the repository and pull request used by GitHub tools.
          </p>
        </div>
      </div>
      <FieldGroup className="gap-3">
        {fields.map(({ key, label, placeholder }) => (
          <Field key={key}>
            <FieldLabel htmlFor={`github-${key}`}>{label}</FieldLabel>
            <Input
              id={`github-${key}`}
              placeholder={placeholder}
              value={github[key]}
              onChange={(event) =>
                updateAgentNode(nodeId, {
                  github: { ...github, [key]: event.target.value },
                })
              }
            />
          </Field>
        ))}
      </FieldGroup>
    </Card>
  );
}
