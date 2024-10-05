import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Console, ConsoleExpression, ConsoleResultInspector } from "@devtools-ds/console";
import { Varhub, VarhubRpcClient } from "@flinbein/varhub-web-client";

const AsyncFunction = async function () {}.constructor as any;

export const RoomActions: FC<{client: VarhubRpcClient}> = ({client}) => {

	const [history, setHistory] = useState<ConsoleExpression[]>([]);
	console.log("RENDER CLIENT", client.ready);

	const [processing, setProcessing] = useState(false);
	const addHistory = useCallback((expr: Omit<ConsoleExpression, "id">) => {
		setHistory(h => ([...h, {
			...expr,
			id: String(h.length),
		}]));
	}, [])

	useEffect(() => {
		const logEvent = (...args: any[]) => {
			addHistory({
				expression: undefined as any,
				severity: "warning",
				result: args
			});
		}
		client.on("message", logEvent);
		console.log("SUBSCRIBE-ON-CLIENT");
		return () => void client.off("message", logEvent);
	}, [client]);

	const varHandle = useMemo(() => Object.create(null), []);
	const proxyMethods = useMemo(() => (
		new Proxy(varHandle, {
			has: () => true,
			get: (handle, m: string) => (m in handle) ? handle[m] : client.call.bind(client, m)
		})
	), [client]);

	const execute = useCallback(async (expression: string) => {
		try {
			if (processing) throw new Error("Processing failed");
			setProcessing(true);
			let async = false, executor: Function;
			try {
				try {
					executor = new Function('p', `with(p) return ${expression}`);
				} catch (error) {
					executor = new AsyncFunction('p', `with(p) return ${expression}`);
					async = true;
				}
			} catch (evalError) {
				addHistory({result: evalError, severity: "error", expression});
				return;
			}

			if (async) try {
				const result = await executor.call(varHandle, proxyMethods);
				varHandle["$_"] = result;
				addHistory({result, expression});
			} catch (error) {
				addHistory({result: error, severity: "error", expression});
			} else try {
				const result = executor.call(varHandle, proxyMethods);
				varHandle["$_"] = result;
				addHistory({result, expression});
			} catch (error) {
				addHistory({result: error, severity: "error", expression});
			}
		} finally {
			setProcessing(false);
		}
	}, []);

	return (
		<div className="console-box">
			<Console
				theme="chrome"
				execute={execute}
				resultComponent={ConsoleResultInspector}
				history={history}
			/>
		</div>
	);
}
