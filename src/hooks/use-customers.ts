import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer, CustomerCreateInput, CustomerUpdateInput, PaginatedResponse, ListParams } from '@/types/api';

const QUERY_KEY = 'customers';
const STORAGE_KEY = 'erp_customers';

// Helper to get customers from localStorage
function getStoredCustomers(): Customer[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return demo data if nothing stored
  return [
    {
      id: "1",
      number: "KD-001",
      name: "Max Müller",
      companyName: "TechStart GmbH",
      email: "max@techstart.ch",
      phone: "+41 44 123 45 67",
      city: "Zürich",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 30,
      discount: 0,
      totalRevenue: 45000,
      projectCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      number: "KD-002",
      name: "Anna Schmidt",
      companyName: "Design Studio AG",
      email: "anna@designstudio.ch",
      phone: "+41 44 987 65 43",
      city: "Bern",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 30,
      discount: 5,
      totalRevenue: 82000,
      projectCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      number: "KD-003",
      name: "Peter Weber",
      companyName: "WebSolutions",
      email: "peter@websolutions.ch",
      phone: "+41 31 456 78 90",
      city: "Basel",
      country: "Schweiz",
      isActive: true,
      paymentTermDays: 14,
      discount: 0,
      totalRevenue: 0,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Helper to save customers to localStorage
function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// Fetch all customers with pagination
export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Customer>> => {
      const customers = getStoredCustomers();
      
      let filtered = [...customers];
      
      // Search filter
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(search) ||
          c.companyName?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.city?.toLowerCase().includes(search)
        );
      }
      
      // Sort
      if (params?.sortBy) {
        filtered.sort((a, b) => {
          const aVal = a[params.sortBy as keyof Customer] || '';
          const bVal = b[params.sortBy as keyof Customer] || '';
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

// Fetch single customer by ID
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      const customers = getStoredCustomers();
      return customers.find(c => c.id === id) || null;
    },
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerCreateInput): Promise<Customer> => {
      const customers = getStoredCustomers();
      const newCustomer: Customer = {
        ...data,
        id: String(Date.now()),
        number: data.number || `KD-${String(customers.length + 1).padStart(3, '0')}`,
        name: data.name,
        paymentTermDays: data.paymentTermDays ?? 30,
        discount: data.discount ?? 0,
        isActive: true,
        totalRevenue: 0,
        projectCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      saveCustomers(customers);
      return newCustomer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerUpdateInput }): Promise<Customer> => {
      const customers = getStoredCustomers();
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      
      customers[index] = {
        ...customers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveCustomers(customers);
      return customers[index];
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const customers = getStoredCustomers();
      const filtered = customers.filter(c => c.id !== id);
      saveCustomers(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Customer stats hook
export function useCustomerStats() {
  const { data } = useCustomers({ pageSize: 1000 });
  
  const customers = data?.data || [];
  const total = customers.length;
  const active = customers.filter(c => c.isActive).length;
  const prospects = customers.filter(c => !c.totalRevenue || c.totalRevenue === 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
  
  return { total, active, prospects, totalRevenue };
}
