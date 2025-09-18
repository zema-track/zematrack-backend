export class ApiResponse {
  success: boolean;
  statusCode: number;
  data: any;
  message: string;
  timestamp: string;

  constructor(statusCode: number, data: any = null, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  // Static methods for common responses
  static success(data: any = null, message: string = "Success"): ApiResponse {
    return new ApiResponse(200, data, message);
  }

  static created(data: any = null, message: string = "Created successfully"): ApiResponse {
    return new ApiResponse(201, data, message);
  }

  static noContent(message: string = "No content"): ApiResponse {
    return new ApiResponse(204, null, message);
  }
}

export class ApiResponseWithPagination extends ApiResponse {
  constructor(
    statusCode: number, 
    items: any[], 
    message: string, 
    total: number, 
    page: number, 
    limit: number
  ) {
    const pages = Math.ceil(total / limit);
    const data = {
      items,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    };
    
    super(statusCode, data, message);
  }

  static paginated(
    items: any[], 
    total: number, 
    page: number, 
    limit: number, 
    message: string = "Data retrieved successfully"
  ): ApiResponseWithPagination {
    return new ApiResponseWithPagination(200, items, message, total, page, limit);
  }
}
