import mongoose, { Model, Document, SortOrder, PopulateOptions } from 'mongoose';
import { ApiError } from "./api-error";

type ModelType<T> = T & Document;

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface QueryOptions {
  sort?: string | { [key: string]: SortOrder } | [string, SortOrder][];
  limit?: number;
  page?: number;
  select?: string;
  populate?: PopulateOptions | PopulateOptions[] | string | string[];
}

export class DatabaseService {
  // Helper method to handle population
  private static applyPopulate(query: any, populate?: PopulateOptions | PopulateOptions[] | string | string[]) {
    if (!populate) return query;

    if (Array.isArray(populate)) {
      for (const pop of populate) {
        query = query.populate(pop);
      }
    } else {
      query = query.populate(populate);
    }
    
    return query;
  }

  // to create a new document
  static async create<T>(model: Model<ModelType<T>>, data: Partial<T>): Promise<T> {
    try {
      const document = await model.create(data);
      return document as T;
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw ApiError.conflict(`${field} already exists`);
      }
      throw error;
    }
  }

  // Get document by ID
  static async getById<T>(
    model: Model<ModelType<T>>, 
    id: string, 
    errorMessage: string = 'Resource not found',
    populate?: PopulateOptions | PopulateOptions[] | string | string[]
  ): Promise<T> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid ID format');
    }

    let query = model.findById(id);
    query = this.applyPopulate(query, populate);

    const document = await query;
    if (!document) {
      throw ApiError.notFound(errorMessage);
    }

    return document as T;
  }

  // Get multiple documents with pagination
  static async getMany<T>(
    model: Model<ModelType<T>>,
    filter: object = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const { 
      sort = { createdAt: -1 }, 
      limit = 10, 
      page = 1, 
      select, 
      populate 
    } = options;

    const skip = (page - 1) * limit;
    const query = { ...filter, deletedAt: { $exists: false } };

    // Build the documents query
    let docsQuery = model.find(query);
    
    if (sort) docsQuery = docsQuery.sort(sort);
    if (select) docsQuery = docsQuery.select(select);
    
    docsQuery = this.applyPopulate(docsQuery, populate);
    docsQuery = docsQuery.skip(skip).limit(limit);

    // Execute both queries in parallel
    const [docs, total] = await Promise.all([
      docsQuery.exec(),
      model.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      items: docs as T[],
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    };
  }

  // Update document by ID
  static async updateById<T>(
    model: Model<ModelType<T>>, 
    id: string, 
    updateData: Partial<T>,
    errorMessage: string = 'Resource not found',
    populate?: PopulateOptions | PopulateOptions[] | string | string[]
  ): Promise<T> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid ID format');
    }

    try {
      let query = model.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      query = this.applyPopulate(query, populate);

      const document = await query;
      if (!document) {
        throw ApiError.notFound(errorMessage);
      }

      return document as T;
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw ApiError.conflict(`${field} already exists`);
      }
      throw error;
    }
  }

  // Soft delete document
  static async softDeleteById<T>(
    model: Model<ModelType<T>>, 
    id: string,
    errorMessage: string = 'Resource not found'
  ): Promise<T> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid ID format');
    }

    const document = await model.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!document) {
      throw ApiError.notFound(errorMessage);
    }

    return document as T;
  }

  // Restore soft deleted document
  static async restoreById<T>(
    model: Model<ModelType<T>>, 
    id: string,
    errorMessage: string = 'Resource not found'
  ): Promise<T> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid ID format');
    }

    const document = await model.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true }
    );

    if (!document) {
      throw ApiError.notFound(errorMessage);
    }

    return document as T;
  }

  // Find one document
  static async findOne<T>(
    model: Model<ModelType<T>>,
    filter: object = {},
    populate?: PopulateOptions | PopulateOptions[] | string | string[]
  ): Promise<T | null> {
    let query = model.findOne({ ...filter, deletedAt: { $exists: false } });
    query = this.applyPopulate(query, populate);
    
    const document = await query;
    return document as T | null;
  }

  // Check if email exists
  static async emailExists<T>(
    model: Model<ModelType<T>>, 
    email: string, 
    excludeId?: string
  ): Promise<boolean> {
    const query: any = { email, deletedAt: { $exists: false } };
    
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: excludeId };
    }
    
    return (await model.countDocuments(query)) > 0;
  }

  // Check if username exists
  static async usernameExists<T>(
    model: Model<ModelType<T>>, 
    username: string, 
    excludeId?: string
  ): Promise<boolean> {
    const query: any = { username, deletedAt: { $exists: false } };
    
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: excludeId };
    }
    
    return (await model.countDocuments(query)) > 0;
  }

  // Generic exists method
  static async exists<T>(
    model: Model<ModelType<T>>, 
    filter: object
  ): Promise<boolean> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return (await model.countDocuments(query)) > 0;
  }

  // Delete permanently (hard delete)
  static async deleteById<T>(
    model: Model<ModelType<T>>, 
    id: string,
    errorMessage: string = 'Resource not found'
  ): Promise<T> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid ID format');
    }

    const document = await model.findByIdAndDelete(id);

    if (!document) {
      throw ApiError.notFound(errorMessage);
    }

    return document as T;
  }
}
