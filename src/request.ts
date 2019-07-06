import { Response } from './response';
import { IRequestOptions, Reject, Resolve } from './ts';

export class Request<TData> {
  public done = false;
  public aborted = false;
  public redirectReq?: Request<TData>;
  public res: Promise<Response<TData>>;

  constructor(
    public xhr: XMLHttpRequest,
    public options: IRequestOptions<TData>,
    cb: (
      req: Request<TData>,
      resolve: Resolve<Response<TData>>,
      reject: Reject
    ) => void
  ) {
    this.res = new Promise((resolve, reject): void =>
      cb(this, resolve, reject)
    );
  }

  public abort(): void {
    if (!this.aborted) {
      this.aborted = true;
      this.xhr.abort();
      if (this.redirectReq) {
        this.redirectReq.abort();
      }
    }
  }
}
