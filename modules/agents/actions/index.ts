'use server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/modules/auth/actions';
import {
  saveAgentInputSchema,
  type SaveAgentInput,
} from '@/modules/builder/lib/schema';
import { loadBuilderDefinition } from '@/modules/workflows/lib/migrate-v1';
import { defaultDefinition } from '../lib/definition';
import { getTemplate } from '../lib/templates';

export async function listAgents() {
  const user = await requireAuth();
  return prisma.agent.findMany({
    where: {
      userId: user.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

export async function fetchAgent(agentId: string) {
  const user = await requireAuth();
  return prisma.agent.findFirst({
    where: {
      id: agentId,
      userId: user.user.id,
    },
  });
}

export async function createBlankAgent() {
  const user = await requireAuth();
  return prisma.agent.create({
    data: {
      userId: user.user.id,
      name: 'Untitled Agent',
      draftDefinition: defaultDefinition(),
    },
  });
}

export async function createFromTemplate(templateId: string) {
  const user = await requireAuth();
  const template = getTemplate(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  return prisma.agent.create({
    data: {
      userId: user.user.id,
      templateId: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      welcomeMessage: template.welcomeMessage,
      starterPrompts: template.starterPrompts,
      draftDefinition: template.definition,
    },
  });
}

export async function deleteAgent(agentId: string) {
  const user = await requireAuth();

  await prisma.agent.deleteMany({
    where: { id: agentId, userId: user.user.id },
  });
}

export async function updateAgent(
  agentId: string,
  data: {
    name?: string;
    description?: string;
    instructions?: string;
  },
) {
  const user = await requireAuth();
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.user.id },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }
  const draftDefinition =
    data.instructions === undefined
      ? undefined
      : loadBuilderDefinition(agent.draftDefinition);

  if (draftDefinition && data.instructions !== undefined) {
    const instructions = data.instructions;
    draftDefinition.nodes = draftDefinition.nodes.map((node) =>
      node.type === 'agent'
        ? { ...node, config: { ...node.config, instructions } }
        : node,
    );
  }

  return prisma.agent.update({
    where: { id: agentId, userId: user.user.id },
    data: {
      name: data.name,
      description: data.description,
      draftDefinition,
    },
  });
}

export async function saveAgent(agentId: string, data: SaveAgentInput) {
  const user = await requireAuth();
  const parsed = saveAgentInputSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Enter a name and a model ID before saving the agent.');
  }

  return prisma.agent.update({
    where: { id: agentId, userId: user.user.id },
    data: parsed.data,
  });
}
