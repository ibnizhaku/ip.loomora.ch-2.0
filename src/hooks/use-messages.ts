import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ChatMessageData {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; firstName: string; lastName: string };
  projectId?: string | null;
  taskId?: string | null;
  createdAt: string;
}

interface PaginatedMessages {
  data: ChatMessageData[];
  total: number;
  page: number;
  pageSize: number;
}

// Stable key builder – strips undefined/falsy fields so both
// useMessages and useSendMessage produce identical shapes.
function buildMessageKey(params: { projectId?: string; taskId?: string }): Record<string, string> {
  const key: Record<string, string> = {};
  if (params.projectId) key.projectId = params.projectId;
  if (params.taskId) key.taskId = params.taskId;
  return key;
}

export function useMessages(params: { projectId?: string; taskId?: string }) {
  const scopeKey = buildMessageKey(params);

  return useQuery({
    queryKey: ['messages', scopeKey],
    queryFn: async (): Promise<PaginatedMessages> => {
      const searchParams = new URLSearchParams();
      if (params.projectId) searchParams.set('projectId', params.projectId);
      if (params.taskId) searchParams.set('taskId', params.taskId);
      searchParams.set('pageSize', '200');
      const qs = searchParams.toString();
      return api.get<PaginatedMessages>(`/messages${qs ? `?${qs}` : ''}`);
    },
    enabled: !!(params.projectId || params.taskId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; projectId?: string; taskId?: string; mentionedUserIds?: string[] }): Promise<ChatMessageData> => {
      return api.post<ChatMessageData>('/messages', data);
    },
    onSuccess: (_data, variables) => {
      // Invalidate using the same stable key shape
      const scopeKey = buildMessageKey(variables);
      queryClient.invalidateQueries({ queryKey: ['messages', scopeKey] });
    },
  });
}
