import { URL } from 'ts-url';
import { Request } from './request';
import { IRequestOptions } from './ts';

export const getRedirectOptions = <TData>(
  req: Request<TData>
): IRequestOptions<TData> | null => {
  const { xhr } = req;
  const { status } = xhr;
  if (status > 300 && status < 400) {
    const { options } = req;
    const maxRedirects = options.maxRedirects || 0;
    if (maxRedirects > 0) {
      const location = xhr.getResponseHeader('Location');
      if (location) {
        const { url } = options;
        const parsedLocation = new URL(location);
        const parsedUrl = new URL(url); // !== req.options.url cuz multiple redirects
        if (!parsedLocation.host) {
          parsedLocation.host = parsedUrl.host;
        }
        if (!parsedLocation.protocol) {
          parsedLocation.protocol = parsedUrl.protocol;
        }

        if (url !== location) {
          return {
            ...options,
            url: parsedLocation.href,
            maxRedirects: (options.maxRedirects || 0) - 1,
            originalReq: req,
          };
        }
      }
    }
  }

  return null;
};
