import { Request } from './request';
import { getResponseData } from './responseData';
import { EndStatus } from './ts';

export class Response<TData> {
  constructor(
    public req: Request<TData>,
    public endStatus: EndStatus,
    public error: Error | null
  ) {}

  get xhr(): XMLHttpRequest {
    return this.req.xhr;
  }

  get status(): number {
    return this.req.xhr.status || 0;
  }

  get statusText(): string {
    return this.req.xhr.statusText || '';
  }

  get success(): boolean {
    const { status } = this;
    return status >= 200 && status < 300;
  }

  get data(): TData {
    return getResponseData(this.req.xhr, this.req.options.json);
  }
}
