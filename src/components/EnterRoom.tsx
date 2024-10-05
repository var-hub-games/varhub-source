import { FC, useEffect, useMemo, useState } from "react";
import { Varhub, VarhubRpcClient } from "@flinbein/varhub-web-client";
import { RoomActions } from "./RoomActions";

interface EnterRoomProps {
	url: string;
	roomId: string;
}
export const EnterRoom: FC<EnterRoomProps> = ({url, roomId}) => {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [client, setClient] = useState<VarhubRpcClient|null>(null);

	const hub = useMemo(() => new Varhub(url), ["url"]);

	const [message, setMessage] = useState<string|null>(null);

	useEffect(() => {
		let active = true;
		hub.getRoomMessage(roomId)
			.then((message) => active && setMessage(message))
			.finally(() => active && setLoading(false))
		;
		return () => {
			active = false;
			setMessage(null);
			setLoading(false);
		}
	}, [hub]);

	const joinRoom = () => {
		if (loading) return;
		try {
			setLoading(true);
			const clientWs = hub.join(roomId, {params: [name]});
			const hubClient = new VarhubRpcClient(clientWs);
			setClient(hubClient);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!client) return;
		const clearClient = () => setClient(null);
		client.on("close", clearClient);
		client.on("ready", () => console.log("CLIENT-READY"));
		client.on("message", (...data) => console.log("CLIENT-MESSAGE", data));
		return () => void client.off("close", clearClient);
	}, [client]);

	if (!client) return (
		<>
			<div className="form-line">
				<input
					value={name}
					placeholder="name"
					autoFocus
					disabled={Boolean(loading)}
					onKeyDown={e => e.key === "Enter" && joinRoom()}
					onChange={e => setName(e.target.value)}
				/>
				<button disabled={Boolean(loading)} onClick={joinRoom}>Join</button>
			</div>
			{(message !== null) && <div>
				<code>{message}</code>
			</div>}
		</>
	);

	return <RoomActions client={client}/>
}
