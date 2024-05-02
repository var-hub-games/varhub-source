import TSWorker from 'url:monaco-editor/esm/vs/language/typescript/ts.worker.js';
import EditorWorker from 'url:monaco-editor/esm/vs/editor/editor.worker.js';
import JSONWorker from 'url:monaco-editor/esm/vs/language/json/json.worker.js';
import varhubModules from "text:@flinbein/varhub-web-client/src/modules.d.ts"
import selfModules from "text:../../modules.d.ts";
import { FC, useEffect, useRef } from "react";
import { editor, languages } from "monaco-editor";

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') return JSONWorker;
		if (label === "javascript" || label === 'typescript') return TSWorker;
		return EditorWorker;
	}
};
languages.typescript.javascriptDefaults.addExtraLib(varhubModules, 'varhubModules.d.ts');
languages.typescript.javascriptDefaults.addExtraLib(selfModules, 'modules.d.ts');


interface EditorProps {
	value?: string;
	defaultValue?: string;
	language: string;
	disabled?: boolean
	onChange?: (value: string) => void;
}
export const Editor: FC<EditorProps> = ({language, value, disabled=false, defaultValue, onChange}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<editor.IStandaloneCodeEditor|undefined>(undefined);

	useEffect(() => {
		if (!editorRef.current) return;
		if (value === editorRef.current.getValue()) return;
		editorRef.current.setValue(String(value));
	}, [value]);

	useEffect(() => {
		if (!editorRef.current) return;
		editorRef.current.updateOptions({readOnly: disabled});
	}, [disabled]);

	useEffect(() => {
		if (!containerRef.current) return;
		const myEditor = editor.create(containerRef.current, {
			automaticLayout: true,
			language: language,
			value: value ?? defaultValue ?? "",
			useShadowDOM: true,
			readOnly: disabled,
			theme: "vs-light",
		});

		editorRef.current = myEditor;
		const updateValue = () => onChange?.(myEditor.getValue());
		const eventListener = myEditor.onDidChangeModelContent(updateValue);
		return () => {
			eventListener.dispose();
			myEditor.dispose();
		}
	}, [language]);

	return <div className={`code-editor ${disabled ? "_disabled" : ""}`} style={{height: 500}} ref={containerRef}></div>
}
