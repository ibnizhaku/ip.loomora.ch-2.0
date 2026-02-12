#!/bin/bash

echo "=== LOOMORA BACKEND 100%-AUDIT ==="
echo "Server: srv1174249"
echo "Datum: $(date)"
echo ""

# Health Check
echo "=== VORBEREITUNG ==="
echo -n "Health Check: "
HEALTH=$(curl -s http://localhost:3001/api/health | jq -r '.status // empty')
if [ "$HEALTH" = "ok" ]; then
  echo "✅ OK"
else
  echo "❌ FAILED"
  exit 1
fi

# Login
echo -n "Login: "
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loomora.ch","password":"admin123"}' | jq -r '.accessToken // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ FAILED"
  exit 1
else
  echo "✅ Token erhalten (${#TOKEN} chars)"
fi

AUTH="Authorization: Bearer $TOKEN"

# Test counters
TOTAL=0
OK=0
FAIL=0
SKIP=0

# Test function
test_endpoint() {
  TOTAL=$((TOTAL + 1))
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="$4"
  
  echo -n "$TOTAL. $name: "
  
  if [ "$method" = "POST" ] && [ -n "$data" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" -H "Content-Type: application/json" "$url" -d "$data")
  elif [ "$method" = "POST" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" "$url")
  else
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$url")
  fi
  
  if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
    echo "✅ $CODE"
    OK=$((OK + 1))
  elif [ "$CODE" = "404" ]; then
    echo "⏭ $CODE (Endpoint nicht gefunden)"
    SKIP=$((SKIP + 1))
  else
    echo "❌ $CODE"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== BLOCK 1: AUTH ==="
test_endpoint "Login" "http://localhost:3001/api/auth/login" "POST" '{"email":"admin@loomora.ch","password":"admin123"}'
test_endpoint "Logout" "http://localhost:3001/api/auth/logout" "POST"

echo ""
echo "=== BLOCK 2: CRM ==="
test_endpoint "Customers List" "http://localhost:3001/api/customers"
test_endpoint "Customers Stats" "http://localhost:3001/api/customers/stats"
test_endpoint "Suppliers List" "http://localhost:3001/api/suppliers"

echo ""
echo "=== BLOCK 3: VERKAUF ==="
test_endpoint "Quotes List" "http://localhost:3001/api/quotes"
test_endpoint "Orders List" "http://localhost:3001/api/orders"
test_endpoint "Invoices List" "http://localhost:3001/api/invoices"
test_endpoint "Invoices Stats" "http://localhost:3001/api/invoices/stats"
test_endpoint "Delivery Notes" "http://localhost:3001/api/delivery-notes"
test_endpoint "Credit Notes" "http://localhost:3001/api/credit-notes"
test_endpoint "Products List" "http://localhost:3001/api/products"
test_endpoint "Products Stats" "http://localhost:3001/api/products/stats"

echo ""
echo "=== BLOCK 4: EINKAUF ==="
test_endpoint "Purchase Orders" "http://localhost:3001/api/purchase-orders"
test_endpoint "Goods Receipts" "http://localhost:3001/api/goods-receipts"
test_endpoint "Purchase Invoices" "http://localhost:3001/api/purchase-invoices"

echo ""
echo "=== BLOCK 5: FINANZEN ==="
test_endpoint "Payments" "http://localhost:3001/api/payments"
test_endpoint "Reminders" "http://localhost:3001/api/reminders"
test_endpoint "Journal Entries" "http://localhost:3001/api/journal-entries"
test_endpoint "Cash Book" "http://localhost:3001/api/cash-book"
test_endpoint "Budgets" "http://localhost:3001/api/budgets"
test_endpoint "Cost Centers" "http://localhost:3001/api/cost-centers"
test_endpoint "Fixed Assets" "http://localhost:3001/api/fixed-assets"
test_endpoint "VAT Returns" "http://localhost:3001/api/vat-returns"

echo ""
echo "=== BLOCK 6: PROJEKTE & HR ==="
test_endpoint "Projects List" "http://localhost:3001/api/projects"
test_endpoint "Projects Stats" "http://localhost:3001/api/projects/stats"
test_endpoint "Tasks" "http://localhost:3001/api/tasks"
test_endpoint "Tasks Stats" "http://localhost:3001/api/tasks/stats"
test_endpoint "Time Entries" "http://localhost:3001/api/time-entries"
test_endpoint "Calendar" "http://localhost:3001/api/calendar"
test_endpoint "Employees" "http://localhost:3001/api/employees"
test_endpoint "Absences" "http://localhost:3001/api/absences"
test_endpoint "Training" "http://localhost:3001/api/training"
test_endpoint "Recruiting" "http://localhost:3001/api/recruiting"

echo ""
echo "=== BLOCK 7: PRODUKTION ==="
test_endpoint "BOM" "http://localhost:3001/api/bom"
test_endpoint "Calculations" "http://localhost:3001/api/calculations"
test_endpoint "Production Orders" "http://localhost:3001/api/production-orders"
test_endpoint "Quality Control" "http://localhost:3001/api/quality"
test_endpoint "Service Tickets" "http://localhost:3001/api/service-tickets"

echo ""
echo "=== BLOCK 8: MARKETING ==="
test_endpoint "Marketing" "http://localhost:3001/api/marketing"
test_endpoint "E-Commerce" "http://localhost:3001/api/ecommerce"

echo ""
echo "=== BLOCK 9: SYSTEM ==="
test_endpoint "Dashboard" "http://localhost:3001/api/dashboard/stats"
test_endpoint "Company" "http://localhost:3001/api/company"
test_endpoint "Audit Log" "http://localhost:3001/api/audit-log"
test_endpoint "Users" "http://localhost:3001/api/users"
test_endpoint "Documents" "http://localhost:3001/api/documents"

echo ""
echo "=== WORKFLOWS ==="
test_endpoint "Check Overdue" "http://localhost:3001/api/invoices/check-overdue" "POST"
test_endpoint "Generate Reminders" "http://localhost:3001/api/reminders/generate" "POST"

echo ""
echo "=== ZUSAMMENFASSUNG ==="
echo "Total Tests: $TOTAL"
echo "✅ OK: $OK"
echo "❌ Fehler: $FAIL"
echo "⏭ Übersprungen: $SKIP"
echo ""
PERCENT=$((OK * 100 / TOTAL))
echo "Success Rate: $PERCENT%"
