import { cosineSimilarity } from "./math.ts";
import type { Turn } from "./text.ts";
import { stringifyTurns, wordOverlapScore } from "./text.ts";

/**
 * @description embedding生成機能を持つモデルのインターフェース
 */
export interface EmbeddingModel {
	embed(text: string): Promise<number[]>;
}

/**
 * @description 類似例の選択と管理を行うクラス
 */
export class Examples {
	private examples: Turn[][] = [];
	private model: EmbeddingModel | null;
	private select_num: number;
	private embeddings: Record<string, number[]> = {};

	constructor(model: EmbeddingModel | null, select_num = 2) {
		this.model = model;
		this.select_num = select_num;
	}

	/**
	 * @description ターン配列からユーザー側テキストを抽出
	 * @param turns - 会話ターン配列
	 * @returns 結合されたテキスト
	 */
	turnsToText(turns: Turn[]): string {
		let messages = "";
		for (const turn of turns) {
			if (turn.role !== "assistant") messages += turn.content.substring(turn.content.indexOf(":") + 1).trim() + "\n";
		}
		return messages.trim();
	}

	/**
	 * @description 例を読み込みembeddingを生成
	 * @param examples - 例の配列
	 */
	async load(examples: Turn[][]): Promise<void> {
		this.examples = examples;
		if (!this.model) return;
		if (this.select_num === 0) return;

		try {
			const embeddingPromises = examples.map((example) => {
				const turn_text = this.turnsToText(example);
				return this.model!.embed(turn_text).then((embedding) => {
					this.embeddings[turn_text] = embedding;
				});
			});
			await Promise.all(embeddingPromises);
		} catch (err) {
			console.warn("Error with embedding model, using word-overlap instead.");
			this.model = null;
		}
	}

	/**
	 * @description 入力に最も関連する例を取得
	 * @param turns - 入力ターン配列
	 * @returns 関連度順にソートされた例
	 */
	async getRelevant(turns: Turn[]): Promise<Turn[][]> {
		if (this.select_num === 0) return [];

		const turn_text = this.turnsToText(turns);
		if (this.model !== null) {
			const embedding = await this.model.embed(turn_text);
			this.examples.sort(
				(a, b) =>
					cosineSimilarity(embedding, this.embeddings[this.turnsToText(b)]) -
					cosineSimilarity(embedding, this.embeddings[this.turnsToText(a)]),
			);
		} else {
			this.examples.sort(
				(a, b) => wordOverlapScore(turn_text, this.turnsToText(b)) - wordOverlapScore(turn_text, this.turnsToText(a)),
			);
		}
		const selected = this.examples.slice(0, this.select_num);
		return JSON.parse(JSON.stringify(selected));
	}

	/**
	 * @description 関連例からプロンプト用メッセージを生成
	 * @param turns - 入力ターン配列
	 * @returns 例を含むメッセージ文字列
	 */
	async createExampleMessage(turns: Turn[]): Promise<string> {
		const selected_examples = await this.getRelevant(turns);

		console.log("selected examples:");
		for (const example of selected_examples) {
			console.log("Example:", example[0].content);
		}

		let msg = "Examples of how to respond:\n";
		for (let i = 0; i < selected_examples.length; i++) {
			const example = selected_examples[i];
			msg += `Example ${i + 1}:\n${stringifyTurns(example)}\n\n`;
		}
		return msg;
	}
}
