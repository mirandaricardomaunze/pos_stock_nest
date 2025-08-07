// src/interceptors/bigint.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformBigIntToString(data)),
    );
  }

  private transformBigIntToString(data: any): any {
    if (typeof data === 'bigint') {
      return data.toString();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.transformBigIntToString(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, this.transformBigIntToString(value)]),
      );
    }
    
    return data;
  }
}