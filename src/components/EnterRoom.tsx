import { FC, useEffect, useMemo, useState } from "react";
import { Varhub, type VarhubClient, RPCChannel } from "@flinbein/varhub-web-client";
import { RoomActions } from "./RoomActions";

interface EnterRoomProps {
	url: string;
	roomId: string;
}
export const EnterRoom: FC<EnterRoomProps> = ({url, roomId}) => {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [client, setClient] = useState<VarhubClient|null>(null);
	const [clientStatus, setClientStatus] = useState<null|"closed"|"ready"|"connecting">(null);
	const [rpc, setRpc] = useState<RPCChannel<any>|null>(null);

	useEffect(() => {
		if (!client) return setClientStatus(null);
		if (client.ready) return setClientStatus("ready");
		if (client.closed) return setClientStatus("closed");
		setClientStatus("connecting");
		const setReady = () => setClientStatus("ready");
		const setClosed = () => setClientStatus("closed");
		client.on("open", setReady) ;
		client.on("close", setClosed);
		return () => {
			client.off("open", setReady);
			client.off("close", setClosed);
		}
	}, [client]);

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
			const hubClient = hub.join(roomId, {params: [name]});
			setClient(() => hubClient);
			const rpc = new RPCChannel(hubClient, "$rpc");
			setRpc(() => rpc);

		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!client) return;
		const clearClient = () => setClient(null);
		client.on("close", clearClient);
		client.on("open", () => console.log("CLIENT-READY"));
		client.on("message", (...data) => console.log("CLIENT-MESSAGE", data));
		return () => void client.off("close", clearClient);
	}, [client]);

	if (!client || !rpc) return (
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

	if (clientStatus !== "ready") {
		return <p>Client status {clientStatus}</p>;
	}

	return <RoomActions rpc={rpc} client={client}/>
}
