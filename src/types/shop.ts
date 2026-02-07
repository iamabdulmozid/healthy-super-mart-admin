export interface Shop {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export interface ShopListResponse {
  statusCode: number;
  message: string;
  data: Shop[];
}
