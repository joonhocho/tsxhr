// https://github.com/pqina/filepond/blob/master/src/js/utils/sendRequest.js
// https://github.com/radiosilence/xr/blob/master/src/xr.ts
// https://github.com/naugtur/xhr/blob/master/index.js
import { end } from './end';
import { getRequestHeaders, setRequestHeaders } from './headers';
import { getRedirectOptions } from './redirect';
import { Request } from './request';
import { getRequestBody } from './requestBody';
import { IRequestOptions, ReadyState } from './ts';
import { getError } from './error';

export const request = <TData = any>(
  options: IRequestOptions<TData>
): Request<TData> =>
  new Request<TData>(
    new XMLHttpRequest(),
    options,
    (req: Request<TData>, resolve, reject): void => {
      const { xhr } = req;
      const {
        method,
        url,
        listeners,
        withCredentials,
        responseType,
        json,
        timeout,
        onProgress,
        onUploadProgress,
        onRedirect,
      } = options;

      try {
        // progress
        xhr.onloadstart = xhr.onloadend = xhr.onprogress = (e): void => {
          if (!req.done && onProgress) {
            onProgress(e);
          }
        };

        // upload progress
        if (onUploadProgress && xhr.upload) {
          xhr.upload.onprogress = (e): void => {
            if (!req.done) {
              onUploadProgress(e);
            }
          };
        }

        // tries to get header info to the app as fast as possible
        xhr.onreadystatechange = (): void => {
          if (xhr.readyState === ReadyState.DONE) {
            // timeout so that this gets called after onload/onerror/onabort
            // should not be here in general
            setTimeout((): void => end(req, 'success', null, resolve), 1);
          }
        };

        xhr.onload = (): void => {
          if (!req.done) {
            const redirectOpts = getRedirectOptions(req);
            if (
              redirectOpts &&
              (!onRedirect || onRedirect(redirectOpts, req) !== false)
            ) {
              // remove listeners
              if (listeners) {
                Object.keys(listeners).forEach((key): void =>
                  xhr.removeEventListener(key, listeners[key])
                );
              }

              const nextReq = request(redirectOpts);
              req.redirectReq = nextReq;
              nextReq.res.then(resolve, reject);
              end(req, 'redirect', null, resolve);
              return;
            }

            end(req, 'success', null, resolve);
          }
        };

        xhr.onerror = (e): void =>
          end(
            req,
            'error',
            getError(xhr, 'XMLHttpRequest.onerror', e),
            resolve
          );
        xhr.onabort = (e): void =>
          end(
            req,
            'abort',
            getError(xhr, 'XMLHttpRequest.onabort', e),
            resolve
          );
        xhr.ontimeout = (e): void =>
          end(
            req,
            'timeout',
            getError(xhr, 'XMLHttpRequest.ontimeout', e),
            resolve
          );

        // add listeners
        if (listeners) {
          Object.keys(listeners).forEach((key): void =>
            xhr.addEventListener(key, listeners[key])
          );
        }

        xhr.open(method, url, true);

        if (withCredentials) {
          // after open
          xhr.withCredentials = true;
        }

        if (timeout) {
          // set timeout if defined (do it after open so IE11 plays ball)
          xhr.timeout = timeout;
          setTimeout(
            (): void =>
              end(req, 'timeout', getError(xhr, 'xhr setTimeout'), resolve),
            timeout
          );
        }

        // set headers
        const headers = getRequestHeaders(options);
        options.headers = headers;
        setRequestHeaders(xhr, headers);

        if (responseType) {
          xhr.responseType = responseType;
        } else if (json) {
          xhr.responseType = 'json';
        }

        xhr.send(getRequestBody(options));
      } catch (e) {
        end(req, 'error', getError(xhr, 'xhr exception', e), resolve);
      }
    }
  );
