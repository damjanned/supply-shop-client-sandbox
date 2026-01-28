import { store } from "@/redux";
import { setToken } from "@/redux/app";
import * as Sentry from "@sentry/react";

export async function createPostRequest<T>(config: {
  url: string;
  body?: any;
  token?: string;
}): Promise<{
  data?: T;
  error?: { message: string; status?: number; extraData?: any };
}> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }
    const response = await fetch(config.url, {
      method: "POST",
      body: config.body ? JSON.stringify(config.body) : undefined,
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      let errorMessage: string;
      let body: any;
      if (response.status === 401) {
        store.dispatch(setToken(""));
        errorMessage = "Session expired, please login again";
      } else {
        const json = await response.json();
        errorMessage = json?.errorMessage;
        body = json;
      }
      throw new NetworkError({
        ...(body || {}),
        status: response.status,
        errorMessage,
      });
    } else {
      const json = await response.json();
      return { data: json };
    }
  } catch (err) {
    Sentry.captureException(err, { level: "error" });
    return { error: err as any };
  }
}

export async function createGetRequest<T>(config: {
  url: string;
  token?: string;
  noHeaders?: boolean;
}): Promise<{
  data?: T;
  error?: { message: string; status?: number; extraData?: any };
}> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }
    const response = await fetch(config.url, {
      method: "GET",
      headers: config.noHeaders ? undefined : headers,
      credentials: config.noHeaders ? undefined : "include",
    });

    if (!response.ok) {
      let errorMessage: string;
      let body: any;
      if (response.status === 401) {
        store.dispatch(setToken(""));
        errorMessage = "Session expired, please login again";
      } else {
        const json = await response.json();
        errorMessage = json?.errorMessage;
        body = json;
      }
      throw new NetworkError({
        ...(body || {}),
        status: response.status,
        errorMessage,
      });
    } else {
      const json = await response.json();
      return { data: json };
    }
  } catch (err) {
    Sentry.captureException(err, { level: "error" });
    return { error: err as any };
  }
}

class NetworkError extends Error {
  public status: number;
  public extraData: any;

  constructor(details: {
    errorMessage?: string;
    status: number;
    [key: string]: any;
  }) {
    const { errorMessage, status, ...rest } = details;
    super(details.errorMessage || "something went wrong");
    this.status = details.status;
    this.extraData = rest;
  }
}
