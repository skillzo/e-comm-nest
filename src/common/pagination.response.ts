// src/common/utils/pagination-response.ts

import { IAPIResponse } from 'interfaces/api-response.interface';

export function buildPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number,
  message = 'Data fetched successfully',
  errors: string | null = null,
): IAPIResponse<T[]> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: {
      data,
      errors,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      message,
      page,
      succeeded: true,
      totalCount,
      totalPages,
    },
  };
}
