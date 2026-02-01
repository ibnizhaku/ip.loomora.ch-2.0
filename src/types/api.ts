// API Types matching Prisma schema

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Customer Types
export interface Customer {
  id: string;
  number: string;
  name: string;
  companyName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  vatNumber?: string;
  paymentTermDays: number;
  discount: number;
  creditLimit?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed/aggregated fields from API
  totalRevenue?: number;
  openInvoices?: number;
  projectCount?: number;
}

export interface CustomerCreateInput {
  number?: string;
  name: string;
  companyName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  vatNumber?: string;
  paymentTermDays?: number;
  discount?: number;
  creditLimit?: number;
  notes?: string;
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {}

// Product Types
export type ProductType = 'PRODUCT' | 'SERVICE';
export type VatRate = 'STANDARD' | 'REDUCED' | 'SPECIAL' | 'ZERO';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: VatRate;
  stockQuantity: number;
  minStock: number;
  maxStock?: number;
  reservedStock?: number;
  isService: boolean;
  isActive: boolean;
  categoryId?: string;
  category?: ProductCategory;
  supplierId?: string;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  margin?: number;
  availableStock?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ProductCreateInput {
  sku?: string;
  name: string;
  description?: string;
  unit?: string;
  purchasePrice?: number;
  salePrice: number;
  vatRate?: VatRate;
  stockQuantity?: number;
  minStock?: number;
  maxStock?: number;
  isService?: boolean;
  categoryId?: string;
  supplierId?: string;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

// Supplier Types
export interface Supplier {
  id: string;
  number: string;
  name: string;
  companyName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  iban?: string;
  paymentTermDays: number;
  notes?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed/aggregated fields
  totalOrders?: number;
  totalValue?: number;
}

export interface SupplierCreateInput {
  number?: string;
  name: string;
  companyName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  iban?: string;
  paymentTermDays?: number;
  notes?: string;
  rating?: number;
}

export interface SupplierUpdateInput extends Partial<SupplierCreateInput> {}

// Query Parameters
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
