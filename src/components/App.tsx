import { FC, useMemo } from "react";
import { CreateRoom } from "./CreateRoom";
import { EnterRoom } from "./EnterRoom";

export const App: FC = () => {

	const joinParams = useMemo(() => {
		const searchParams = new URLSearchParams(location.search);
		const url = searchParams.get("url");
		const roomId = searchParams.get("room");
		if (!url || !roomId) return undefined;
		return {url, roomId};
	}, [])

	if (!joinParams) return (
		<CreateRoom/>
	);
	return <EnterRoom {...joinParams} />;
}
