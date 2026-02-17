/**
 * Response Mappers - Backend to Frontend field mapping
 * Ensures API responses match Frontend interfaces exactly
 */

// Invoice: Backend → Frontend
export function mapInvoiceResponse(invoice: any) {
  if (!invoice) return invoice;
  
  const { date, totalAmount, paidAt, ...rest } = invoice;
  
  return {
    ...rest,
    issueDate: date,
    total: totalAmount ? Number(totalAmount) : 0,
    paidDate: paidAt,
    // Keep computed fields
    openAmount: invoice.openAmount ?? (Number(totalAmount || 0) - Number(invoice.paidAmount || 0)),
    isOverdue: invoice.isOverdue,
    // Ensure numeric fields
    subtotal: invoice.subtotal ? Number(invoice.subtotal) : 0,
    vatAmount: invoice.vatAmount ? Number(invoice.vatAmount) : 0,
    paidAmount: invoice.paidAmount ? Number(invoice.paidAmount) : 0,
  };
}

// Quote: Backend → Frontend
export function mapQuoteResponse(quote: any) {
  if (!quote) return quote;
  
  const { date, ...rest } = quote;
  
  return {
    ...rest,
    issueDate: date,
    // Ensure numeric fields
    subtotal: quote.subtotal ? Number(quote.subtotal) : 0,
    vatAmount: quote.vatAmount ? Number(quote.vatAmount) : 0,
    total: quote.total ? Number(quote.total) : 0,
  };
}

// Order: Backend → Frontend
export function mapOrderResponse(order: any) {
  if (!order) return order;
  
  const { date, ...rest } = order;
  
  return {
    ...rest,
    orderDate: date,
    // Ensure numeric fields
    subtotal: order.subtotal ? Number(order.subtotal) : 0,
    vatAmount: order.vatAmount ? Number(order.vatAmount) : 0,
    total: order.total ? Number(order.total) : 0,
  };
}

// Employee: Backend → Frontend
export function mapEmployeeResponse(employee: any) {
  if (!employee) return employee;
  
  const { number, ahvNumber, iban, departmentId, department, ...rest } = employee;
  
  // Get salary info from active contract if available
  const activeContract = employee.contracts?.find((c: any) => !c.endDate || new Date(c.endDate) > new Date());
  
  return {
    ...rest,
    employeeNumber: number,
    ahvNumber: ahvNumber || null,
    socialSecurityNumber: ahvNumber,
    bankAccount: iban,
    iban: iban || null,
    department: department ? (typeof department === 'object' ? department : { name: department }) : null,
    departmentId,
    // Flatten contract fields for frontend compatibility
    salary: activeContract?.baseSalary ? Number(activeContract.baseSalary) : undefined,
    workHoursPerWeek: activeContract?.workHoursPerWeek ? Number(activeContract.workHoursPerWeek) : undefined,
    vacationDays: activeContract?.vacationDays,
    wageClass: activeContract?.wageClass,
  };
}

// Payslip: Backend → Frontend (with PayslipItems)
export function mapPayslipResponse(payslip: any) {
  if (!payslip) return payslip;
  
  const items = payslip.items || [];
  
  // Group items by category
  const earnings = items
    .filter((i: any) => i.category === 'EARNING')
    .map((i: any) => ({
      description: i.description,
      amount: Number(i.amount),
      type: i.type,
      rate: i.rate ? Number(i.rate) : undefined,
    }));
  
  const deductions = items
    .filter((i: any) => i.category === 'DEDUCTION')
    .map((i: any) => ({
      description: i.description,
      amount: Number(i.amount),
      type: i.type,
      rate: i.rate ? Number(i.rate) : undefined,
    }));
  
  const expenses = items
    .filter((i: any) => i.category === 'EXPENSE')
    .map((i: any) => ({
      description: i.description,
      amount: Number(i.amount),
    }));
  
  const employerContributions = items
    .filter((i: any) => i.category === 'EMPLOYER_CONTRIBUTION')
    .map((i: any) => ({
      description: i.description,
      amount: Number(i.amount),
    }));
  
  return {
    id: payslip.id,
    employeeId: payslip.employeeId,
    employee: payslip.employee,
    period: `${getMonthName(payslip.month)} ${payslip.year}`,
    periodStart: new Date(payslip.year, payslip.month - 1, 1).toISOString(),
    periodEnd: new Date(payslip.year, payslip.month, 0).toISOString(),
    paymentDate: payslip.paymentDate,
    status: payslip.status?.toLowerCase() || 'draft',
    workingTime: {
      targetHours: payslip.targetHours ? Number(payslip.targetHours) : 0,
      actualHours: payslip.actualHours ? Number(payslip.actualHours) : 0,
      overtime: payslip.overtimeHours ? Number(payslip.overtimeHours) : 0,
      holidays: payslip.holidayDays ? Number(payslip.holidayDays) : 0,
      sickDays: payslip.sickDays ? Number(payslip.sickDays) : 0,
      vacationDays: payslip.vacationDays ? Number(payslip.vacationDays) : 0,
    },
    earnings,
    deductions,
    expenses,
    employerContributions,
    grossSalary: Number(payslip.grossSalary || 0),
    netSalary: Number(payslip.netSalary || 0),
    totalDeductions: Number(payslip.totalDeductions || 0),
    totalExpenses: Number(payslip.totalExpenses || 0),
    totalEmployerCost: Number(payslip.totalEmployerCost || 0),
  };
}

// DeliveryNote: Backend → Frontend
export function mapDeliveryNoteResponse(deliveryNote: any) {
  if (!deliveryNote) return deliveryNote;
  
  return {
    ...deliveryNote,
    // deliveryDate bleibt wie es ist (Prisma-Feld heißt bereits deliveryDate, nicht date)
    customerName: deliveryNote.customer?.name,
    orderNumber: deliveryNote.order?.number,
  };
}

// CreditNote: Backend → Frontend
export function mapCreditNoteResponse(creditNote: any) {
  if (!creditNote) return creditNote;
  
  const { date, totalAmount, ...rest } = creditNote;
  
  return {
    ...rest,
    issueDate: date,
    total: totalAmount ? Number(totalAmount) : 0,
    customerName: creditNote.customer?.name,
    invoiceNumber: creditNote.invoice?.number,
    subtotal: creditNote.subtotal ? Number(creditNote.subtotal) : 0,
    vatAmount: creditNote.vatAmount ? Number(creditNote.vatAmount) : 0,
  };
}

// PurchaseOrder: Backend → Frontend
export function mapPurchaseOrderResponse(purchaseOrder: any) {
  if (!purchaseOrder) return purchaseOrder;
  
  const { date, totalAmount, ...rest } = purchaseOrder;
  
  return {
    ...rest,
    orderDate: date,
    total: totalAmount ? Number(totalAmount) : 0,
    supplierName: purchaseOrder.supplier?.name,
    projectName: purchaseOrder.project?.name,
    subtotal: purchaseOrder.subtotal ? Number(purchaseOrder.subtotal) : 0,
    vatAmount: purchaseOrder.vatAmount ? Number(purchaseOrder.vatAmount) : 0,
  };
}

// PurchaseInvoice: Backend → Frontend
export function mapPurchaseInvoiceResponse(purchaseInvoice: any) {
  if (!purchaseInvoice) return purchaseInvoice;
  
  const { date, totalAmount, paidAt, ...rest } = purchaseInvoice;
  
  return {
    ...rest,
    invoiceDate: date,
    total: totalAmount ? Number(totalAmount) : 0,
    paidDate: paidAt,
    supplierName: purchaseInvoice.supplier?.name,
    purchaseOrderNumber: purchaseInvoice.purchaseOrder?.number,
    subtotal: purchaseInvoice.subtotal ? Number(purchaseInvoice.subtotal) : 0,
    vatAmount: purchaseInvoice.vatAmount ? Number(purchaseInvoice.vatAmount) : 0,
    openAmount: purchaseInvoice.openAmount ?? (Number(totalAmount || 0) - Number(purchaseInvoice.paidAmount || 0)),
  };
}

// Helper
function getMonthName(month: number): string {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return months[month - 1] || '';
}

// Paginated response wrapper
export function mapPaginatedResponse<T>(
  response: { data: any[]; total: number; page: number; pageSize: number; totalPages: number },
  mapper: (item: any) => T
) {
  return {
    ...response,
    data: response.data.map(mapper),
  };
}
