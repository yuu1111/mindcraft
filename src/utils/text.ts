/**
 * @description 会話ターンの1メッセージを表す
 * @property role - メッセージの役割
 * @property content - メッセージ内容
 */
export interface Turn {
	role: "user" | "assistant" | "system";
	content: string;
}

/**
 * @description ターン配列を可読文字列に変換
 * @param turns - 会話ターン配列
 * @returns フォーマット済み文字列
 */
export function stringifyTurns(turns: Turn[]): string {
	let res = "";
	for (const turn of turns) {
		if (turn.role === "assistant") {
			res += `\nYour output:\n${turn.content}`;
		} else if (turn.role === "system") {
			res += `\nSystem output: ${turn.content}`;
		} else {
			res += `\nUser input: ${turn.content}`;
		}
	}
	return res.trim();
}

/**
 * @description ターン配列を単一プロンプト文字列に変換
 * @param turns - 会話ターン配列
 * @param system - システムプロンプト
 * @param stop_seq - 区切り文字列
 * @param model_nickname - モデルの表示名
 * @returns 単一プロンプト文字列
 */
export function toSinglePrompt(
	turns: Turn[],
	system: string | null = null,
	stop_seq = "***",
	model_nickname = "assistant",
): string {
	let prompt = system ? `${system}${stop_seq}` : "";
	let role = "";
	turns.forEach((message) => {
		role = message.role;
		if (role === "assistant") role = model_nickname;
		prompt += `${role}: ${message.content}${stop_seq}`;
	});
	if (role !== model_nickname) prompt += model_nickname + ": ";
	return prompt;
}

/**
 * @internal
 * @description テキストから英単語リストを抽出
 * @param text - 入力テキスト
 * @returns 小文字の単語配列
 */
function _getWords(text: string): string[] {
	return text
		.replace(/[^a-zA-Z ]/g, "")
		.toLowerCase()
		.split(" ");
}

/**
 * @description 2つのテキスト間の単語重複スコアを計算
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @returns 重複スコア (0 ~ 1)
 */
export function wordOverlapScore(text1: string, text2: string): number {
	const words1 = _getWords(text1);
	const words2 = _getWords(text2);
	const intersection = words1.filter((word) => words2.includes(word));
	return intersection.length / (words1.length + words2.length - intersection.length);
}

/**
 * @description 厳密なターン順序を保証(systemをuserに変換、連続同一roleを処理)
 * @param turns - 会話ターン配列
 * @returns 整形済みターン配列
 */
export function strictFormat(turns: Turn[]): Turn[] {
	let prev_role: string | null = null;
	const messages: Turn[] = [];
	const filler: Turn = { role: "user", content: "_" };
	for (const msg of turns) {
		if (typeof msg.content === "string") {
			msg.content = msg.content.trim();
		}
		if (msg.role === "system") {
			msg.role = "user";
			msg.content = "SYSTEM: " + msg.content;
		}
		if (msg.role === prev_role && msg.role === "assistant") {
			messages.push(filler);
			messages.push(msg);
		} else if (msg.role === prev_role) {
			messages[messages.length - 1].content += "\n" + msg.content;
		} else {
			messages.push(msg);
		}
		prev_role = msg.role;
	}
	if (messages.length > 0 && messages[0].role !== "user") {
		messages.unshift(filler);
	}
	if (messages.length === 0) {
		messages.push(filler);
	}
	return messages;
}
