declare module "varhub:api/network" {
	export interface NetworkApi {
		fetch<T extends keyof BodyType>(url: string, params?: FetchParams<T>): Promise<FetchResult<T>>
	}
	type BodyType = {
		json: unknown;
		text: string;
		arrayBuffer: ArrayBuffer;
		formData: Array<[string, string | FileJson]>
	}

	interface FileJson {
		type: string,
		size: number,
		name: string,
		lastModified: number,
		data: ArrayBuffer
	}

	export type FetchParams<T extends keyof BodyType = keyof BodyType> = {
		type?: T
		method?: RequestInit["method"],
		headers?: Record<string, string>,
		body?: string | ArrayBuffer | Array<[string, string] | [string, FileJson] | [string, ArrayBuffer, string]>
		redirect?: RequestInit["redirect"],
		credentials?: RequestInit["credentials"]
		mode?: RequestInit["mode"]
		referrer?: RequestInit["referrer"]
		referrerPolicy?: RequestInit["referrerPolicy"]
	};

	export interface FetchResult<T extends keyof BodyType = keyof BodyType> {
		url: string,
		ok: boolean,
		type: string,
		statusText: string,
		redirected: boolean,
		status: number,
		headers: Record<string, string>,
		body: BodyType[T],
	}

	const api: NetworkApi
	export default api;
}

