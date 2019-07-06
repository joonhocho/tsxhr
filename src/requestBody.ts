import { contentTypeJsonRegex } from './const';
import { IRequestOptions, RequestBody } from './ts';

export const getRequestBody = ({
  data,
  headers,
}: Pick<IRequestOptions<any>, 'headers' | 'data'>): RequestBody => {
  const body = data == null ? null : data;
  if (
    body != null &&
    typeof body !== 'string' &&
    headers &&
    contentTypeJsonRegex.test(
      headers['content-type'] || headers['Content-Type'] || ''
    )
  ) {
    return JSON.stringify(body);
  }
  return body;
};
