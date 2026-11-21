import { Suspense } from 'react';

import {
  BuilderPageContent,
  BuilderPageLoading,
} from '@/modules/agents/components/builder-page-content';

type BuilderPageProps = PageProps<'/agents/[agentId]/builder'>;

export default function BuilderPage({ params }: BuilderPageProps) {
  return (
    <Suspense fallback={<BuilderPageLoading />}>
      <AgentBuilderRoute params={params} />
    </Suspense>
  );
}

async function AgentBuilderRoute({ params }: Pick<BuilderPageProps, 'params'>) {
  const { agentId } = await params;
  return <BuilderPageContent agentId={agentId} />;
}
