import { FC, useMemo, useState } from "react";
import { Editor } from "./code/Editor";
import { Varhub } from "@flinbein/varhub-web-client";
import defaultCode from "./defaultCode.ts?raw";
import { useLocalStorage } from "../use/useLocalStorage";

export const CreateRoom: FC = () => {
	const [code, setCode] = useLocalStorage<string>("code", defaultCode);
	const [jsonCode, setJsonCode] = useLocalStorage<string>("jsonCode", "{}");
	const [loggerId, setLoggerId] = useState<string>(Math.random().toString(36).substring(2));
	const [url, setUrl] = useLocalStorage("url", "https://varhub.dpohvar.ru/");
	const [roomId, setRoomId] = useState("");
	const [loading, setLoading] = useState(false);

	const loggerCreateStringUrl = useMemo<string|undefined>(() => {
		try {
			if (!loggerId) return;
			const vUrl = new URL(url);
			return `devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${vUrl.host}/log/${loggerId}`
		} catch {}
	}, [url, loggerId])

	const inviteUrl = useMemo<string|null>(() => {
		if (!url) return null;
		if (!roomId) return null;
		const resultUrl = new URL(location.href);
		resultUrl.searchParams.set("url", url);
		resultUrl.searchParams.set("room", roomId);
		return resultUrl.href;
	}, [roomId, url]);

	const createRoom = async () => {
		if (loading) return;
		try {
			setLoading(true);
			const hub = new Varhub(url);
			const roomInfo = await hub.createRoom("ivm", {
				module: {
					main: "index.js",
					source: {"index.js": code},
				},
				integrity: false,
				config: jsonCode ? JSON.parse(jsonCode) : undefined,
				inspect: loggerId ?? undefined
			});
			setRoomId(roomInfo.id);
		} finally {
			setLoading(false);
		}
	}

	const [selectedFile, setSelectedFile] = useState<string>("index.js");

	return (
		<div>
			<div className="form-line _no-grow">
				<button onClick={() => setSelectedFile("index.js")} className={selectedFile === "index.js" ? "_tab-active" : undefined}>
					<code>index.js</code>
				</button>
				<button onClick={() => setSelectedFile("varhub:config")} className={selectedFile === "varhub:config" ? "_tab-active" : undefined}>
					<code>varhub:config</code>
				</button>
			</div>
			{selectedFile === "index.js" && (
				<Editor key={selectedFile} language="javascript" defaultValue={code} onChange={setCode} disabled={Boolean(loading || roomId)}/>
			)}
			{selectedFile === "varhub:config" && (
				<Editor key={selectedFile} language="json" defaultValue={jsonCode} onChange={setJsonCode} disabled={Boolean(loading || roomId)}/>
			)}

			<div className="form-line">
				<input disabled={Boolean(loading || roomId)} placeholder="varhub url" value={url} onChange={e => setUrl(e.target.value)} />
				<input disabled={Boolean(loading || roomId)} placeholder="logger id" value={loggerId} onChange={e => setLoggerId(e.target.value)} />
				<button disabled={Boolean(loading || roomId)} onClick={createRoom}>Create room</button>
			</div>

			{loggerCreateStringUrl && <div>
				create logger by opening url:
				<p><code>{loggerCreateStringUrl}</code></p>
			</div>}

			{roomId && (
				<div>
					<p>Room <code>{roomId}</code> created at <code>{url}</code></p>
					<p>
						<a href={inviteUrl ?? ""} target="_blank" rel="noopener noreferrer">{inviteUrl}</a>
					</p>
				</div>
			)}
		</div>
	);
}
