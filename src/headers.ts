import { IRequestOptions, RequestHeaders } from './ts';

export const getRequestHeaders = ({
  headers,
  method,
  json,
}: Pick<IRequestOptions<any>, 'headers' | 'method' | 'json'>):
  | RequestHeaders
  | undefined => {
  // set headers
  let copy = headers;
  if (json) {
    copy = { ...headers };
    if (!copy.accept && !copy.Accept) {
      copy.Accept = 'application/json';
    }
    if (
      method !== 'GET' &&
      method !== 'HEAD' &&
      !copy['content-type'] &&
      !copy['Content-Type']
    ) {
      copy['Content-Type'] = 'application/json';
    }
  }
  return copy;
};

export const setRequestHeaders = (
  xhr: XMLHttpRequest,
  headers: RequestHeaders | undefined
): void => {
  if (headers) {
    Object.keys(headers).forEach((key): void =>
      xhr.setRequestHeader(key, headers![key])
    );
  }
};
