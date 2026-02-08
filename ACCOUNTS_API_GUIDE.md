# Accounts Module - API Integration Guide

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

Production:
```
https://api.healthysupermart.com/api/v1
```

---

## 1. Get Transactions (Paginated)

### Endpoint
```
GET /cashbook/transactions
```

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shopId | number | Yes | Shop identifier |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| type | string | No | Filter by type: `sale`, `return`, `withdraw`, `deposit` |
| paymentMethod | string | No | Filter by method: `cash`, `card` |
| startDate | string | No | Filter from date (YYYY-MM-DD) |
| endDate | string | No | Filter to date (YYYY-MM-DD) |

### Example Request
```bash
curl --location 'http://localhost:3000/api/v1/cashbook/transactions?shopId=3&page=1&limit=20&type=sale&paymentMethod=cash' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response
```json
{
  "transactions": [
    {
      "id": 7,
      "shopId": 3,
      "userId": 5,
      "orderId": 31,
      "type": "return",
      "paymentMethod": "cash",
      "amount": -1200,
      "notes": "Order #31 canceled - automatic refund",
      "transactionDate": "2025-11-08",
      "createdAt": "2025-11-08T00:09:20.192Z",
      "updatedAt": "2025-11-08T00:09:20.192Z"
    },
    {
      "id": 6,
      "shopId": 3,
      "userId": 5,
      "orderId": null,
      "type": "withdraw",
      "paymentMethod": "cash",
      "amount": -60,
      "notes": "Test withdrawal",
      "transactionDate": "2025-11-08",
      "createdAt": "2025-11-07T15:12:12.673Z",
      "updatedAt": "2025-11-07T15:12:12.673Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| transactions | array | Array of transaction objects |
| total | number | Total count of transactions |
| page | number | Current page number |
| limit | number | Items per page |
| totalPages | number | Total number of pages |
| hasNextPage | boolean | Whether next page exists |
| hasPreviousPage | boolean | Whether previous page exists |

### Transaction Object Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Transaction ID |
| shopId | number | Shop identifier |
| userId | number | User who created the transaction |
| orderId | number \| null | Associated order ID (if applicable) |
| type | string | Transaction type: `sale`, `return`, `withdraw`, `deposit` |
| paymentMethod | string | Payment method: `cash`, `card` |
| amount | number | Transaction amount (negative for outflows) |
| notes | string | Transaction notes/description |
| transactionDate | string | Date of transaction (YYYY-MM-DD) |
| createdAt | string | Record creation timestamp (ISO 8601) |
| updatedAt | string | Record update timestamp (ISO 8601) |

---

## 2. Create Withdrawal

### Endpoint
```
POST /cashbook/withdraw
```

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "shopId": 3,
  "amount": 100,
  "paymentMethod": "cash",
  "notes": "Cash withdrawal for expenses",
  "transactionDate": "2025-11-08"
}
```

### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| shopId | number | Yes | Shop identifier |
| amount | number | Yes | Withdrawal amount (positive number) |
| paymentMethod | string | Yes | Payment method: `cash` or `card` |
| notes | string | Yes | Reason for withdrawal |
| transactionDate | string | No | Date of withdrawal (YYYY-MM-DD), defaults to today |

### Example Request
```bash
curl --location 'http://localhost:3000/api/v1/cashbook/withdraw' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--header 'Content-Type: application/json' \
--data '{
  "shopId": 3,
  "amount": 100,
  "paymentMethod": "cash",
  "notes": "Cash withdrawal for expenses",
  "transactionDate": "2025-11-08"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Withdrawal created successfully",
  "transaction": {
    "id": 10,
    "shopId": 3,
    "userId": 5,
    "orderId": null,
    "type": "withdraw",
    "paymentMethod": "cash",
    "amount": -100,
    "notes": "Cash withdrawal for expenses",
    "transactionDate": "2025-11-08",
    "createdAt": "2025-11-08T10:30:00.000Z",
    "updatedAt": "2025-11-08T10:30:00.000Z"
  }
}
```

### Notes
- Amount will be stored as negative in the database
- transactionDate is optional and defaults to current date
- User ID is automatically extracted from the authorization token

---

## 3. Get Day Summary

### Endpoint
```
GET /cashbook/summary
```

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shopId | number | Yes | Shop identifier |
| date | string | No | Specific date for summary (YYYY-MM-DD), defaults to today |

### Example Request
```bash
curl --location 'http://localhost:3000/api/v1/cashbook/summary?shopId=3&date=2025-11-08' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response
```json
{
  "date": "2025-11-08",
  "totalSales": 5500.00,
  "totalReturns": -1200.00,
  "totalWithdrawals": -150.00,
  "totalDeposits": 0.00,
  "netAmount": 4150.00,
  "cashSales": 3500.00,
  "cardSales": 2000.00,
  "transactionCount": 15
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| date | string | Summary date (YYYY-MM-DD) |
| totalSales | number | Sum of all sales for the day |
| totalReturns | number | Sum of all returns (negative value) |
| totalWithdrawals | number | Sum of all withdrawals (negative value) |
| totalDeposits | number | Sum of all deposits |
| netAmount | number | Net cash flow (sales - returns - withdrawals + deposits) |
| cashSales | number | Total sales made with cash |
| cardSales | number | Total sales made with card |
| transactionCount | number | Total number of transactions |

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "amount": ["Amount must be greater than 0"],
    "notes": ["Notes is required"]
  },
  "statusCode": 400
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Service Layer Usage

### TypeScript/JavaScript Example

```typescript
import { CashbookService } from '@/modules/admin/services/cashbookService';

// Get transactions
const fetchTransactions = async () => {
  try {
    const response = await CashbookService.getTransactions(
      3,      // shopId
      1,      // page
      20,     // limit
      {       // filters (optional)
        type: 'sale',
        paymentMethod: 'cash',
        startDate: '2025-11-01',
        endDate: '2025-11-08'
      }
    );
    
    console.log(response.transactions);
    console.log(`Total: ${response.total}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Create withdrawal
const createWithdrawal = async () => {
  try {
    const response = await CashbookService.createWithdrawal(3, {
      amount: 100,
      paymentMethod: 'cash',
      notes: 'Petty cash withdrawal',
      transactionDate: '2025-11-08'
    });
    
    console.log('Withdrawal created:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get day summary
const fetchSummary = async () => {
  try {
    const summary = await CashbookService.getDaySummary(
      1,              // shopId
      '2025-11-08'   // date (optional)
    );
    
    console.log('Net Amount:', summary.netAmount);
    console.log('Total Sales:', summary.totalSales);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Authentication

All API endpoints require authentication via Bearer token:

1. Login to get access token:
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "password"
}
```

2. Use the token in subsequent requests:
```
Authorization: Bearer {access_token}
```

The token is automatically handled by the `apiClient` service, which:
- Retrieves token from localStorage
- Adds it to all requests
- Handles 401 errors by redirecting to login

---

## Rate Limiting

- Standard rate limits apply per the API configuration
- Consider implementing client-side caching for summary data
- Use pagination to avoid loading large datasets

---

## Best Practices

1. **Always validate user input** before sending to API
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during API calls
4. **Use pagination** for large datasets
5. **Cache data** when appropriate to reduce API calls
6. **Implement retry logic** for failed requests
7. **Log errors** for debugging purposes

---

## Development vs Production

### Development
- Base URL: `http://localhost:3000/api/v1`
- CORS enabled for local testing
- Detailed error messages

### Production
- Base URL: `https://api.healthysupermart.com/api/v1`
- Stricter CORS policies
- Generic error messages for security
- Rate limiting enforced

Configure in `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
