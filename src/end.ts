import { Request } from './request';
import { Response } from './response';
import { EndStatus, Resolve } from './ts';

export const end = <TData>(
  req: Request<TData>,
  status: EndStatus,
  resolve: Resolve<Response<TData>>
): void => {
  if (!req.done) {
    req.done = true;
    req.aborted = status === 'abort';
    if (status !== 'redirect') {
      resolve(new Response(req, status));
    }
  }
};
