import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Folder;
  children?: Folder[];
  path: string;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DMSDocument {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  folder?: Folder;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  tags?: string[];
  metadata?: Record<string, any>;
  isArchived: boolean;
  archivedAt?: string;
  retentionDate?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  versions?: DocumentVersion[];
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  changeNotes?: string;
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  folderId?: string;
  tags?: string[];
  projectId?: string;
  customerId?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
}

// Folders
export function useFolders(parentId?: string) {
  return useQuery({
    queryKey: ['folders', parentId],
    queryFn: async (): Promise<Folder[]> => {
      const params = parentId ? `?parentId=${parentId}` : '';
      return api.get<Folder[]>(`/documents/folders${params}`);
    },
  });
}

export function useFolder(id: string | undefined) {
  return useQuery({
    queryKey: ['folders', 'detail', id],
    queryFn: async (): Promise<Folder | null> => {
      if (!id) return null;
      return api.get<Folder>(`/documents/folders/${id}`);
    },
    enabled: !!id,
  });
}

export function useFolderTree() {
  return useQuery({
    queryKey: ['folders', 'tree'],
    queryFn: async (): Promise<Folder[]> => {
      // Build tree from flat list - backend returns flat folders
      const folders = await api.get<Folder[]>('/documents/folders');
      return buildFolderTree(folders);
    },
  });
}

// Helper to build folder tree from flat list
function buildFolderTree(folders: Folder[]): Folder[] {
  const map = new Map<string, Folder>();
  const roots: Folder[] = [];
  
  folders.forEach(f => map.set(f.id, { ...f, children: [] }));
  folders.forEach(f => {
    const folder = map.get(f.id)!;
    if (f.parentId && map.has(f.parentId)) {
      map.get(f.parentId)!.children!.push(folder);
    } else {
      roots.push(folder);
    }
  });
  
  return roots;
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; parentId?: string }): Promise<Folder> => {
      return api.post<Folder>('/documents/folders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Folder> }): Promise<Folder> => {
      return api.put<Folder>(`/documents/folders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/documents/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

// Documents
export function useDMSDocuments(params?: ListParams) {
  return useQuery({
    queryKey: ['dms-documents', params],
    queryFn: async (): Promise<PaginatedResponse<DMSDocument>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('query', params.search);
      if (params?.folderId) searchParams.set('folderId', params.folderId);
      if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.linkedEntityType) searchParams.set('linkedEntityType', params.linkedEntityType);
      if (params?.linkedEntityId) searchParams.set('linkedEntityId', params.linkedEntityId);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<DMSDocument>>(`/documents${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useDMSDocument(id: string | undefined) {
  return useQuery({
    queryKey: ['dms-documents', id],
    queryFn: async (): Promise<DMSDocument | null> => {
      if (!id) return null;
      return api.get<DMSDocument>(`/documents/${id}`);
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { file: File; folderId?: string; projectId?: string; customerId?: string; description?: string }): Promise<DMSDocument> => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.folderId) formData.append('folderId', data.folderId);
      if (data.projectId) formData.append('projectId', data.projectId);
      if (data.customerId) formData.append('customerId', data.customerId);
      if (data.description) formData.append('description', data.description);
      return api.upload<DMSDocument>('/documents/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DMSDocument> }): Promise<DMSDocument> => {
      return api.put<DMSDocument>(`/documents/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dms-documents', id] });
    },
  });
}

export function useUploadNewVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: FormData }): Promise<DMSDocument> => {
      return api.post<DMSDocument>(`/documents/${documentId}/versions`, data);
    },
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dms-documents', documentId] });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<DMSDocument> => {
      return api.patch<DMSDocument>(`/documents/${id}/archive`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useMoveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, folderId }: { documentId: string; folderId?: string }): Promise<DMSDocument> => {
      return api.patch<DMSDocument>(`/documents/${documentId}/move`, { folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-documents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

// Document Statistics
export function useDocumentStats() {
  return useQuery({
    queryKey: ['documents', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalDocuments: number;
        totalFolders: number;
        totalSize: number;
        recentUploads: number;
        archivedDocuments: number;
      }>('/documents/statistics');
    },
  });
}
