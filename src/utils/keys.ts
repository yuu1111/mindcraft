import { readFileSync } from "fs";

let keys: Record<string, string> = {};
try {
	const data = readFileSync("./keys.json", "utf8");
	keys = JSON.parse(data);
} catch (err) {
	console.warn("keys.json not found. Defaulting to environment variables.");
}

/**
 * @description 指定名のAPIキーを取得(keys.json優先、なければ環境変数)
 * @param name - キー名
 * @returns APIキー文字列
 * @throws キーが見つからない場合
 */
export function getKey(name: string): string {
	let key = keys[name];
	if (!key) {
		key = process.env[name] ?? "";
	}
	if (!key) {
		throw new Error(`API key "${name}" not found in keys.json or environment variables!`);
	}
	return key;
}

/**
 * @description 指定名のAPIキーが存在するか確認
 * @param name - キー名
 * @returns キー文字列、存在しなければundefined
 */
export function hasKey(name: string): string | undefined {
	return keys[name] || process.env[name];
}
