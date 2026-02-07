# Accounts Module - Testing Checklist

## Pre-Testing Setup
- [ ] Ensure backend API is running at `http://localhost:3000`
- [ ] Verify you have a valid authentication token
- [ ] Confirm shopId is set (defaults to 3)
- [ ] Check that user has `analytics:read` permission

## 1. Sidebar Navigation Testing
- [ ] Verify "Accounts" menu appears in sidebar
- [ ] Check that Accounts menu has BanknotesIcon
- [ ] Click on "Accounts" - should expand/collapse
- [ ] Verify chevron icon changes on expand/collapse
- [ ] Check all three sub-menus are visible when expanded:
  - [ ] Transactions
  - [ ] Day Summary
  - [ ] Withdraw

## 2. Transactions Page Testing (/accounts/transactions)

### Initial Load
- [ ] Navigate to Accounts → Transactions
- [ ] Verify page loads without errors
- [ ] Check that summary cards display correctly
- [ ] Confirm transactions table renders
- [ ] Verify loading state shows during API call

### Filters
- [ ] Test Transaction Type filter
  - [ ] Select "Sale" - verify only sales show
  - [ ] Select "Return" - verify only returns show
  - [ ] Select "Withdraw" - verify only withdrawals show
  - [ ] Select "Deposit" - verify only deposits show
  - [ ] Select "All Types" - verify all transactions show

- [ ] Test Payment Method filter
  - [ ] Select "Cash" - verify only cash transactions show
  - [ ] Select "Card" - verify only card transactions show
  - [ ] Select "All Methods" - verify all transactions show

- [ ] Test Date Range filter
  - [ ] Set start date - verify filtering works
  - [ ] Set end date - verify filtering works
  - [ ] Set both dates - verify range filtering works
  - [ ] Click "Reset Filters" - verify all filters clear

### Pagination
- [ ] Verify pagination controls appear at bottom
- [ ] Check "Previous" button is disabled on page 1
- [ ] Click "Next" button - verify page increments
- [ ] Click page number - verify direct navigation works
- [ ] Verify "Next" button disables on last page
- [ ] Check page info displays correctly (e.g., "Showing 1 to 20 of 100")

### Table Display
- [ ] Verify all columns display correctly:
  - [ ] ID
  - [ ] Date (formatted: MMM dd, yyyy)
  - [ ] Time (formatted: HH:mm:ss)
  - [ ] Type (with icon and badge)
  - [ ] Payment Method (with icon)
  - [ ] Amount (with color coding)
  - [ ] Order ID (or dash if null)
  - [ ] Notes

- [ ] Check transaction type badges:
  - [ ] Sale - green background
  - [ ] Return - red background
  - [ ] Withdraw - orange background
  - [ ] Deposit - blue background

- [ ] Verify amount formatting:
  - [ ] Positive amounts in green with + sign
  - [ ] Negative amounts in red with - sign
  - [ ] Currency symbol (৳) displays

- [ ] Check icons:
  - [ ] ArrowDownCircleIcon for sales/deposits (green)
  - [ ] ArrowUpCircleIcon for returns/withdrawals (red)
  - [ ] BanknotesIcon for cash payments
  - [ ] CreditCardIcon for card payments

### Edge Cases
- [ ] Test with no transactions (empty state)
- [ ] Test with API error (error message display)
- [ ] Test filter combinations
- [ ] Test rapid page changes

## 3. Day Summary Page Testing (/accounts/summary)

### Initial Load
- [ ] Navigate to Accounts → Day Summary
- [ ] Verify page loads with today's date selected
- [ ] Check loading state appears
- [ ] Confirm summary cards render after load

### Date Selection
- [ ] Verify date picker defaults to today
- [ ] Select a different date - verify data updates
- [ ] Select a date with no data - verify empty state
- [ ] Select a past date - verify historical data loads

### Summary Cards
- [ ] Verify Net Amount card (main card):
  - [ ] Displays correct amount
  - [ ] Shows formatted date
  - [ ] Has gradient background
  - [ ] Shows BanknotesIcon

- [ ] Check Stats Grid:
  - [ ] Total Sales displays with green color
  - [ ] Total Returns displays with red color
  - [ ] Total Withdrawals displays with orange color
  - [ ] All amounts formatted correctly

- [ ] Verify Payment Methods Grid:
  - [ ] Cash Sales displays
  - [ ] Card Sales displays
  - [ ] Both have appropriate icons

- [ ] Check Additional Info:
  - [ ] Total Transactions count displays
  - [ ] Total Deposits displays

### Edge Cases
- [ ] Test with no data for selected date
- [ ] Test with API error
- [ ] Test date picker with invalid inputs

## 4. Withdraw Page Testing (/accounts/withdraw)

### Form Display
- [ ] Navigate to Accounts → Withdraw
- [ ] Verify form renders correctly
- [ ] Check all fields are present:
  - [ ] Amount input
  - [ ] Payment Method select
  - [ ] Transaction Date picker
  - [ ] Notes textarea
  - [ ] Submit button

- [ ] Verify information panel displays:
  - [ ] Guidelines list
  - [ ] Shop ID information

### Form Validation
- [ ] Try submitting with amount = 0 → should show error
- [ ] Try submitting with negative amount → should show error
- [ ] Try submitting without notes → should show error
- [ ] All validation errors display clearly

### Form Submission
- [ ] Fill in valid data:
  - Amount: 100
  - Payment Method: Cash
  - Date: Today
  - Notes: "Test withdrawal"

- [ ] Click "Create Withdrawal" button:
  - [ ] Loading state shows ("Processing...")
  - [ ] Button disabled during submission
  - [ ] Success message appears on success
  - [ ] Form resets after successful submission

### Edge Cases
- [ ] Test with very large amounts
- [ ] Test with decimal amounts
- [ ] Test with different payment methods
- [ ] Test with past dates
- [ ] Test with future dates
- [ ] Test with API error (error message displays)
- [ ] Test rapid multiple submissions

## 5. Integration Testing

### Navigation Flow
- [ ] Navigate between all three Accounts pages
- [ ] Verify active state highlights correctly
- [ ] Check breadcrumbs/page titles are correct
- [ ] Test browser back/forward buttons

### State Persistence
- [ ] Apply filters on Transactions page
- [ ] Navigate away and back
- [ ] Verify filters don't persist (reset state)

### API Integration
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to Transactions page
- [ ] Verify API call to `/api/v1/cashbook/transactions`
- [ ] Check request includes correct query params
- [ ] Verify response data structure matches expectations

- [ ] Navigate to Day Summary page
- [ ] Verify API call to `/api/v1/cashbook/summary`
- [ ] Check request includes shopId and date params

- [ ] Submit withdrawal on Withdraw page
- [ ] Verify POST to `/api/v1/cashbook/withdraw`
- [ ] Check request body is correct
- [ ] Verify success response

### Authorization
- [ ] Test with user lacking `analytics:read` permission
- [ ] Verify redirect to unauthorized page
- [ ] Test with valid permissions
- [ ] Verify full access granted

## 6. UI/UX Testing

### Responsiveness
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet view
- [ ] Test on mobile view
- [ ] Verify tables scroll horizontally on small screens

### Visual Consistency
- [ ] Colors match existing admin panel theme
- [ ] Fonts and sizes are consistent
- [ ] Spacing and padding look good
- [ ] Icons are properly sized and aligned
- [ ] Buttons have consistent styling

### Accessibility
- [ ] All inputs have labels
- [ ] Required fields marked with asterisk
- [ ] Error messages are clear
- [ ] Success feedback is obvious
- [ ] Color contrast is sufficient

## 7. Performance Testing
- [ ] Page loads within 2 seconds
- [ ] Filtering updates quickly
- [ ] Pagination is smooth
- [ ] No console errors
- [ ] No console warnings
- [ ] No memory leaks on navigation

## Bug Reporting Template
If you find any issues, report them with:
- **Page**: Which page (Transactions/Summary/Withdraw)
- **Steps to Reproduce**: Exact steps to trigger the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Console Errors**: Any errors in browser console

## Notes
- Default shopId is 3 (can be changed in localStorage)
- All amounts are in Bangladeshi Taka (৳)
- Date formats use date-fns library
- Pagination shows 20 items per page
- API base URL from environment variable or defaults to production
