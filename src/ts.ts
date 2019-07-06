import { Request } from './request';

export type HttpMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export type ErrorReason = 'timeout' | 'abort' | 'error';

export type EndStatus = 'success' | 'redirect' | ErrorReason;

export type RequestHeaders = Record<string, string>;

export type RequestBody = Document | BodyInit | null;

export type EventListener = (e: unknown) => void;

export enum ReadyState {
  UNSENT = 0, // Client has been created. open() not called yet.
  OPENED = 1, // open() has been called.
  HEADERS_RECEIVED = 2, // send() has been called, and headers and status are available.
  LOADING = 3, // 	Downloading; responseText holds partial data.
  DONE = 4,
}

export interface IRequestOptions<TData> {
  method: HttpMethod;
  url: string;
  data?: any;
  headers?: RequestHeaders;
  listeners?: Record<string, EventListener>;
  withCredentials?: boolean;
  responseType?: XMLHttpRequestResponseType;
  json?: boolean;
  timeout?: number;
  maxRedirects?: number;
  onProgress?: (e: ProgressEvent) => void;
  onUploadProgress?: (e: ProgressEvent) => void;
  onRedirect?: (
    options: IRequestOptions<TData>,
    req: Request<TData>
  ) => boolean | void;
  originalReq?: Request<TData>;
}

export type Resolve<T> = (value?: T | PromiseLike<T> | undefined) => void;

export type Reject = (reason?: any) => void;
