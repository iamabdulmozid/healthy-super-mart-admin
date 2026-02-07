# Accounts Module - File Structure

```
pos-admin/
├── src/
│   ├── types/
│   │   └── transaction.ts                    # ✨ NEW - Transaction type definitions
│   │
│   ├── modules/admin/
│   │   ├── services/
│   │   │   └── cashbookService.ts            # ✨ NEW - API service for cashbook
│   │   │
│   │   ├── components/
│   │   │   ├── TransactionFilters.tsx        # ✨ NEW - Filter component
│   │   │   └── TransactionTable.tsx          # ✨ NEW - Table component
│   │   │
│   │   └── pages/
│   │       ├── TransactionsPage.tsx          # ✨ NEW - Main transactions page
│   │       ├── DaySummaryPage.tsx            # ✨ NEW - Day summary page
│   │       └── WithdrawPage.tsx              # ✨ NEW - Withdraw page
│   │
│   ├── components/layout/
│   │   └── Sidebar.tsx                       # 📝 MODIFIED - Added Accounts menu
│   │
│   └── routes/
│       └── AppRoutes.tsx                     # 📝 MODIFIED - Added Accounts routes
│
└── ACCOUNTS_INTEGRATION_SUMMARY.md           # 📄 Documentation
```

## Component Hierarchy

```
Accounts Menu (Sidebar)
│
├── Transactions (/accounts/transactions)
│   ├── TransactionFilters
│   │   ├── Type Filter (sale, return, withdraw, deposit)
│   │   ├── Payment Method Filter (cash, card)
│   │   ├── Start Date Filter
│   │   └── End Date Filter
│   │
│   ├── Summary Cards
│   │   ├── Total Transactions
│   │   ├── Current Page Info
│   │   ├── Items Per Page
│   │   └── Shop ID
│   │
│   ├── TransactionTable
│   │   └── Transaction Rows
│   │       ├── ID
│   │       ├── Date & Time
│   │       ├── Type (with icon & badge)
│   │       ├── Payment Method (with icon)
│   │       ├── Amount (color-coded)
│   │       ├── Order ID (if applicable)
│   │       └── Notes
│   │
│   └── Pagination Controls
│       ├── Previous/Next Buttons
│       └── Page Number Buttons
│
├── Day Summary (/accounts/summary)
│   ├── Date Picker
│   ├── Net Amount Card (main display)
│   ├── Stats Grid
│   │   ├── Total Sales
│   │   ├── Total Returns
│   │   └── Total Withdrawals
│   ├── Payment Methods Grid
│   │   ├── Cash Sales
│   │   └── Card Sales
│   └── Additional Info
│       ├── Total Transactions
│       └── Total Deposits
│
└── Withdraw (/accounts/withdraw)
    ├── Withdrawal Form
    │   ├── Amount Input
    │   ├── Payment Method Select
    │   ├── Transaction Date Picker
    │   ├── Notes Textarea
    │   └── Submit Button
    │
    └── Information Panel
        └── Guidelines & Tips
```

## Data Flow

```
User Action → Component → Service → API → Response → Component → UI Update

Example: Fetching Transactions
1. User navigates to /accounts/transactions
2. TransactionsPage component mounts
3. useEffect triggers fetchTransactions()
4. CashbookService.getTransactions() called
5. API request to /api/v1/cashbook/transactions
6. Response with paginated data
7. State updated (setTransactions)
8. TransactionTable re-renders with data
```

## State Management

### TransactionsPage State
- `transactions: Transaction[]` - List of transactions
- `isLoading: boolean` - Loading indicator
- `error: string | null` - Error messages
- `filters: TransactionFilters` - Active filters
- `currentPage: number` - Current pagination page
- `totalPages: number` - Total number of pages
- `total: number` - Total transaction count
- `hasNextPage: boolean` - Pagination flag
- `hasPreviousPage: boolean` - Pagination flag

### DaySummaryPage State
- `summary: DaySummary | null` - Summary data
- `isLoading: boolean` - Loading indicator
- `error: string | null` - Error messages
- `selectedDate: string` - Selected date for summary

### WithdrawPage State
- `formData: CreateWithdrawRequest` - Form data
- `isLoading: boolean` - Submission state
- `error: string | null` - Error messages
- `success: string | null` - Success messages
```
