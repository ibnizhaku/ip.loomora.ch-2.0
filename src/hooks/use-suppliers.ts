import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Supplier, SupplierCreateInput, SupplierUpdateInput, PaginatedResponse, ListParams } from '@/types/api';

const QUERY_KEY = 'suppliers';
const STORAGE_KEY = 'erp_suppliers';

// Helper to get suppliers from localStorage
function getStoredSuppliers(): Supplier[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return demo data if nothing stored
  return [
    {
      id: "1",
      number: "LF-001",
      name: "Hans Meier",
      companyName: "Bürobedarf AG",
      email: "hans@buerobedarf.ch",
      phone: "+41 44 111 22 33",
      city: "Zürich",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 30,
      totalValue: 15000,
      rating: 4.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      number: "LF-002",
      name: "Fritz Schneider",
      companyName: "IT Systems GmbH",
      email: "fritz@itsystems.ch",
      phone: "+41 44 333 44 55",
      city: "Bern",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 14,
      totalValue: 45000,
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      number: "LF-003",
      name: "Maria Huber",
      companyName: "Druckerei Zentral",
      email: "maria@druckerei.ch",
      phone: "+41 31 666 77 88",
      city: "Luzern",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 30,
      totalValue: 8500,
      rating: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Helper to save suppliers to localStorage
function saveSuppliers(suppliers: Supplier[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

// Fetch all suppliers with pagination
export function useSuppliers(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Supplier>> => {
      const suppliers = getStoredSuppliers();
      
      let filtered = [...suppliers];
      
      // Search filter
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(search) ||
          s.companyName?.toLowerCase().includes(search) ||
          s.email?.toLowerCase().includes(search) ||
          s.city?.toLowerCase().includes(search)
        );
      }
      
      // Sort
      if (params?.sortBy) {
        filtered.sort((a, b) => {
          const aVal = a[params.sortBy as keyof Supplier] || '';
          const bVal = b[params.sortBy as keyof Supplier] || '';
          const order = params.sortOrder === 'desc' ? -1 : 1;
          return String(aVal).localeCompare(String(bVal)) * order;
        });
      }
      
      // Pagination
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);
      
      return {
        data: paginatedData,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    },
  });
}

// Fetch single supplier by ID
export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<Supplier | null> => {
      if (!id) return null;
      const suppliers = getStoredSuppliers();
      return suppliers.find(s => s.id === id) || null;
    },
    enabled: !!id,
  });
}

// Create supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SupplierCreateInput): Promise<Supplier> => {
      const suppliers = getStoredSuppliers();
      const newSupplier: Supplier = {
        ...data,
        id: String(Date.now()),
        number: data.number || `LF-${String(suppliers.length + 1).padStart(3, '0')}`,
        name: data.name,
        paymentTermDays: data.paymentTermDays ?? 30,
        isActive: true,
        totalValue: 0,
        rating: data.rating ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      suppliers.push(newSupplier);
      saveSuppliers(suppliers);
      return newSupplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierUpdateInput }): Promise<Supplier> => {
      const suppliers = getStoredSuppliers();
      const index = suppliers.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Supplier not found');
      
      suppliers[index] = {
        ...suppliers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveSuppliers(suppliers);
      return suppliers[index];
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const suppliers = getStoredSuppliers();
      const filtered = suppliers.filter(s => s.id !== id);
      saveSuppliers(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Supplier stats hook
export function useSupplierStats() {
  const { data } = useSuppliers({ pageSize: 1000 });
  
  const suppliers = data?.data || [];
  const total = suppliers.length;
  const active = suppliers.filter(s => s.isActive).length;
  const newSuppliers = suppliers.filter(s => {
    const created = new Date(s.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
  }).length;
  const totalValue = suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0);
  const avgRating = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length 
    : 0;
  
  return { total, active, newSuppliers, totalValue, avgRating };
}
