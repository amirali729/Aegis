// import type { BaseResponse } from '@pikslots/shared';
// implements BaseResponse<T> 

export class PikslotsBaseResponse<T> {
  readonly data: T;
  readonly statusCode: number;
  readonly timestamp: string;

  constructor(data: T, statusCode: number) {
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
