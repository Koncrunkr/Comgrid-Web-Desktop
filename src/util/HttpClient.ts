import { RequestWrapper } from './request/Request';
import { apiLink } from './Constants';
import { getState } from './State';
import { AlertType, makeAlert } from '../common/AlertItem';

export class HttpClient {
  constructor(private readonly apiLink: string) {}

  async proceedRequest<T>(
    request: RequestWrapper<T>,
    onFailure: (code: number, errorText: string) => unknown = (code, errorText) =>
      makeAlert({ type: AlertType.Error, message: () => errorText }),
    onNetworkFailure: (reason: any) => unknown = reason =>
      alert(`network error: ${reason}`),
  ): Promise<T> {
    const finalLink = new URL(this.apiLink + request.endpoint);
    if (request.parameters != undefined)
      finalLink.search = new URLSearchParams(request.parameters).toString();

    let headers = {
      ...request.headers,
      ...(await getState().whenReady()).getAuthorizationHeader(),
    };
    console.log({ ...request, headers: headers });
    return fetch(finalLink.toString(), {
      method: request.methodType,
      headers: headers,
      credentials: 'omit',
      body: request.body,
    }).then(async response => {
      if (response.status === 200) {
        return request.proceedRequest(response);
      } else {
        const errorText = await response.text();
        onFailure(response.status, errorText);
        // @ts-ignore
        throw new TypeError(JSON.stringify({ code: response.status, errorText }));
      }
    });
  }
}

let httpClient: HttpClient;

export function getHttpClient(): HttpClient {
  if (!httpClient) httpClient = new HttpClient(apiLink);
  return httpClient;
}

export enum MethodType {
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
