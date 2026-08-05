export type MockRequest<T = unknown> = {
  body: T;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
};

export function mockReq<T = unknown>(
  body: T = {} as T,
  params: Record<string, unknown> = {},
  query: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
) {
  return {
    body,
    params,
    query,
    headers,
  } as MockRequest<T>;
}

export type MockResponse = {
  statusCode?: number;
  payload?: unknown;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
  send(payload: unknown): MockResponse;
};

export function mockRes(): MockResponse {
  const res = {} as MockResponse;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: unknown) => {
    res.payload = payload;
    return res;
  };
  res.send = (payload: unknown) => {
    res.payload = payload;
    return res;
  };
  return res;
}
