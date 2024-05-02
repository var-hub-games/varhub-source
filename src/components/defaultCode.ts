import room from "varhub:room";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';
// import network from "varhub:api/network";

room.on("join", () => {
	room.broadcast("updatePlayers", room.getPlayers());
});

export function sendMessage(msg){
	room.broadcast("message", this.player, msg);
	return true;
}

export function getRapier(){
	return RAPIER;
}
