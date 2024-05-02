import { FC, useEffect, useState } from "react";
import { Varhub, VarhubClient } from "@flinbein/varhub-web-client";
import { RoomActions } from "./RoomActions";


interface EnterRoomProps {
	url: string;
	roomId: string;
}
export const EnterRoom: FC<EnterRoomProps> = ({url, roomId}) => {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [client, setClient] = useState<VarhubClient|null>(null);

	const joinRoom = async () => {
		if (loading) return;
		try {
			setLoading(true);
			const hub = new Varhub(url);
			const hubClient = await hub.join(roomId, name, {});
			setClient(hubClient);``
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!client) return;
		const clearClient = () => setClient(null);
		client.on("close", clearClient);
		return () => void client.off("close", clearClient);
	}, [client]);

	if (!client) return (
		<div className="form-line">
			<input disabled={Boolean(loading)} placeholder="name" value={name} onChange={e => setName(e.target.value)}/>
			<button disabled={Boolean(loading)} onClick={joinRoom}>Join</button>
		</div>
	);

	return <RoomActions client={client}/>
}
