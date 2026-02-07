// src/services/uploadService.ts
import { apiClient } from '@/lib/api-client';

export interface UploadResponse {
  key: string;
  publicUrl: string;
}

export class UploadService {
  private readonly baseEndpoint = '/uploads';

  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>(
      `${this.baseEndpoint}/products`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  async uploadCategoryImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>(
      `${this.baseEndpoint}/categories`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }
}

export const uploadService = new UploadService();