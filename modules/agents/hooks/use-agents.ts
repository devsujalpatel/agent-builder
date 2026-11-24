'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import {
  createBlankAgent,
  createFromTemplate,
  deleteAgent,
  fetchAgent,
  listAgents,
  saveAgent,
} from '@/modules/agents/actions';
import type { SaveAgentInput } from '@/modules/builder/lib/schema';
import { agentKeys } from '@/modules/agents/lib/query-keys';

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: listAgents,
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => fetchAgent(agentId),
  });
}

export function useCreateBlankAgent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createBlankAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
    onError: () => toast.error('Couldn’t create the agent. Try again.'),
  });
}

export function useCreateFromTemplate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createFromTemplate,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
    onError: () => toast.error('Couldn’t create the agent. Try again.'),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push('/agents');
    },
  });
}

export function useSaveAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAgentInput) => saveAgent(agentId, data),
    onSuccess: (agent) => {
      queryClient.setQueryData(agentKeys.detail(agentId), agent);
      void queryClient.invalidateQueries({ queryKey: agentKeys.list() });
    },
  });
}
