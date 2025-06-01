// interfaces/api-response.interface.ts

export interface IAPIResponse<T> {
  data: {
    data: T;
    errors: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    message: string;
    page: number;
    succeeded: boolean;
    totalCount: number;
    totalPages: number;
  };
}
