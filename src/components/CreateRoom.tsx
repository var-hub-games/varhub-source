import { FC, useMemo, useState } from "react";
import { Editor } from "./code/Editor";
import { Varhub } from "@flinbein/varhub-web-client";
import defaultCode from "text:./defaultCode.ts";



export const CreateRoom: FC = () => {
	const [code, setCode] = useState<string>(defaultCode);
	const [jsonCode, setJsonCode] = useState<string>("{}");
	const [url, setUrl] = useState("https://varhub.dpohvar.ru/");
	const [mode, setMode] = useState(1);
	const [roomId, setRoomId] = useState("");
	const [loading, setLoading] = useState(false);

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
			const roomInfo = await hub.createRoom({
				main: "index.js",
				source: {"index.js": code},
			}, {integrity: false, async: Boolean(mode), config: jsonCode ? JSON.parse(jsonCode) : undefined });
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
				<Editor key={selectedFile} language="javascript" value={code} onChange={setCode} disabled={Boolean(loading || roomId)}/>
			)}
			{selectedFile === "varhub:config" && (
				<Editor key={selectedFile} language="json" value={jsonCode} onChange={setJsonCode} disabled={Boolean(loading || roomId)}/>
			)}

			<div className="form-line">
				<input disabled={Boolean(loading || roomId)} placeholder="varhub url" value={url} onChange={e => setUrl(e.target.value)} />
				<select disabled={Boolean(loading || roomId)} value={mode} onChange={e => setMode(Number(e.target.value))}>
					<option value={0}>default mode</option>
					<option value={1}>async module loader</option>
				</select>
				<button disabled={Boolean(loading || roomId)} onClick={createRoom}>Create room</button>
			</div>

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
