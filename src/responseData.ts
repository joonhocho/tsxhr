import { contentTypeJsonRegex } from './const';

export const getResponseData = (xhr: XMLHttpRequest, json?: boolean): any => {
  try {
    const { response } = xhr;
    if (response !== undefined) {
      return response;
    }

    const { responseText } = xhr;
    if (
      responseText &&
      (json ||
        contentTypeJsonRegex.test(
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
