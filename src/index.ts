// https://github.com/pqina/filepond/blob/master/src/js/utils/sendRequest.js
// https://github.com/radiosilence/xr/blob/master/src/xr.ts
// https://github.com/naugtur/xhr/blob/master/index.js

export type HTTPMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export class Request<TData> {
  public done = false;
  public success = false;
  public aborted = false;
  public timedout = false;

  public headersReceived = false;

  constructor(
    public xhr: XMLHttpRequest,
    public response: Promise<IRequestResponse<TData>>
  ) {}

  public abort(): void {
    if (!this.aborted) {
      this.aborted = true;
      this.done = true;
      this.xhr.abort();
    }
  }
}

export type Listener = (e: unknown) => void;

export interface IRequestOptions<TData> {
  method: HTTPMethod;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  listeners?: Record<string, Listener>;
  withCredentials?: boolean;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  json?: boolean;
  onHeaders?: (req: Request<TData>) => void;
  onProgress?: (e: ProgressEvent) => void;
  onUploadProgress?: (e: ProgressEvent) => void;
}

export type ErrorReason = 'timeout' | 'abort' | 'error';

export interface IRequestResponse<TData> {
  status: number;
  statusText: string;
  success: boolean;
  data: TData | undefined;
  error: ErrorReason | undefined;
  xhr: XMLHttpRequest;
}

export enum ReadyState {
  UNSENT = 0, // Client has been created. open() not called yet.
  OPENED = 1, // open() has been called.
  HEADERS_RECEIVED = 2, // send() has been called, and headers and status are available.
  LOADING = 3, // 	Downloading; responseText holds partial data.
  DONE = 4,
}

const jsonRegex = /^application\/json\b/i;

const getData = (xhr: XMLHttpRequest, json?: boolean): any => {
  try {
    const { response } = xhr;
    if (response !== undefined) {
      return response;
    }

    const { responseText } = xhr;
    if (
      responseText &&
      (json ||
        jsonRegex.test(
          xhr.getResponseHeader('Content-Type') ||
            xhr.getResponseHeader('content-type') ||
            ''
        ))
    ) {
      return JSON.parse(responseText);
    }

    return responseText;
  } catch (e) {
    // noop
  }
};

export const request = <TData = any>({
  method,
  url,
  headers,
  listeners,
  data,
  withCredentials,
  responseType,
  timeout,
  json,
  onHeaders,
  onProgress,
  onUploadProgress,
}: IRequestOptions<TData>): Request<TData> => {
  const xhr = new XMLHttpRequest();

  const getResponse = (error?: ErrorReason): IRequestResponse<TData> => ({
    status: xhr.status || 0,
    statusText: xhr.statusText || '',
    success: xhr.status >= 200 && xhr.status < 300,
    get data(): TData {
      return getData(xhr, json);
    },
    error,
    xhr,
  });

  const req = new Request<TData>(
    xhr,
    new Promise<IRequestResponse<TData>>((resolve): void => {
      // progress
      xhr.onloadstart = xhr.onloadend = xhr.onprogress = (e): void => {
        if (!req.done && onProgress) {
          onProgress(e);
        }
      };

      if (onUploadProgress && xhr.upload) {
        xhr.upload.onprogress = (e): void => {
          if (!req.done) {
            onUploadProgress(e);
          }
        };
      }

      // tries to get header info to the app as fast as possible
      xhr.onreadystatechange = (): void => {
        if (xhr.readyState < ReadyState.HEADERS_RECEIVED) {
          // not interesting in these states ('unsent' and 'openend' as they don't give us any additional info)
          return;
        }

        if (!req.headersReceived) {
          req.headersReceived = true;
          if (onHeaders) {
            onHeaders(req);
          }
        }

        if (!req.done && xhr.readyState === ReadyState.DONE) {
          req.done = true;
          req.success = true;
          resolve(getResponse());
        }
      };

      xhr.onload = (): void => {
        if (!req.done) {
          req.done = true;
          req.success = true;
          resolve(getResponse());
        }
      };

      xhr.onerror = (): void => {
        if (!req.done) {
          req.done = true;
          req.success = false;
          resolve(getResponse('error'));
        }
      };

      xhr.onabort = (): void => {
        if (!req.done) {
          req.done = true;
          req.aborted = true;
          req.success = false;
          resolve(getResponse('abort'));
        }
      };

      xhr.ontimeout = (): void => {
        if (!req.done) {
          req.done = true;
          req.timedout = true;
          req.success = false;
          resolve(getResponse('timeout'));
        }
      };

      xhr.open(method, url, true);

      if (withCredentials) {
        // after open
        xhr.withCredentials = true;
      }

      if (timeout) {
        // set timeout if defined (do it after open so IE11 plays ball)
        xhr.timeout = timeout;
        setTimeout(() => {
          if (!req.done) {
            req.done = true;
            req.timedout = true;
            req.success = false;
            resolve(getResponse('timeout'));
          }
        }, timeout);
      }

      // set headers
      let headersCopy = headers;
      if (json) {
        headersCopy = { ...headers };
        if (!headersCopy) {
          headersCopy = {};
        }
        if (!headersCopy.accept && !headersCopy.Accept) {
          headersCopy.Accept = 'application/json';
        }
        if (
          method !== 'GET' &&
          method !== 'HEAD' &&
          !headersCopy['content-type'] &&
          !headersCopy['Content-Type']
        ) {
          headersCopy['Content-Type'] = 'application/json';
        }
      }

      if (headersCopy) {
        Object.keys(headersCopy).forEach((key) =>
          xhr.setRequestHeader(key, headersCopy![key])
        );
      }

      if (listeners) {
        Object.keys(listeners).forEach((key) =>
          xhr.addEventListener(key, listeners[key])
        );
      }

      if (responseType) {
        xhr.responseType = responseType;
      } else if (json) {
        xhr.responseType = 'json';
      }

      let body = data == null ? null : data;
      if (
        body != null &&
        typeof body !== 'string' &&
        headersCopy &&
        jsonRegex.test(
          headersCopy['content-type'] || headersCopy['Content-Type'] || ''
        )
      ) {
        body = JSON.stringify(body);
      }

      xhr.send(body);
    })
  );

  return req;
};
