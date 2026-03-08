/**
 * @description アプリケーション全体の設定値
 * @property minecraft_version - Minecraftバージョン("auto"で自動検出)
 * @property host - サーバーホスト
 * @property port - サーバーポート
 * @property auth - 認証方式
 * @property mindserver_port - MindServerのポート
 * @property auto_open_ui - 起動時にブラウザでUIを開くか
 * @property base_profile - ベースプロファイル名
 * @property profiles - プロファイルファイルパスの配列
 * @property load_memory - 前回セッションのメモリをロードするか
 * @property init_message - スポーン時に全員に送るメッセージ
 * @property only_chat_with - チャット対象のユーザー名(空で全体公開)
 * @property speak - テキスト読み上げの有効化
 * @property chat_ingame - ゲーム内チャットにレスポンスを表示するか
 * @property language - 翻訳先言語
 * @property render_bot_view - ボット視点をブラウザに表示するか
 * @property allow_insecure_coding - コード実行の許可
 * @property allow_vision - スクリーンショット入力の許可
 * @property blocked_actions - 無効化するコマンド一覧
 * @property code_timeout_mins - コード実行タイムアウト(分、-1で無制限)
 * @property relevant_docs_count - プロンプト用に選択するドキュメント数(-1で全て)
 * @property max_messages - コンテキストに保持するメッセージ数上限
 * @property num_examples - モデルに提供する例の数
 * @property max_commands - 連続レスポンスで使用可能な最大コマンド数(-1で無制限)
 * @property show_command_syntax - コマンド構文の表示レベル
 * @property narrate_behavior - 自動行動をチャットで通知するか
 * @property chat_bot_messages - 他のボットへのメッセージを公開チャットにするか
 * @property spawn_timeout - スポーンタイムアウト(秒)
 * @property block_place_delay - ブロック設置間の遅延(ms)
 * @property log_all_prompts - 全プロンプトをファイルに記録するか
 */
export interface Settings {
	minecraft_version: string;
	host: string;
	port: number;
	auth: string;
	mindserver_port: number;
	auto_open_ui: boolean;
	base_profile: string;
	profiles: string[];
	load_memory: boolean;
	init_message: string;
	only_chat_with: string[];
	speak: boolean | string;
	chat_ingame: boolean;
	language: string;
	render_bot_view: boolean;
	allow_insecure_coding: boolean;
	allow_vision: boolean;
	blocked_actions: string[];
	code_timeout_mins: number;
	relevant_docs_count: number;
	max_messages: number;
	num_examples: number;
	max_commands: number;
	show_command_syntax: string;
	narrate_behavior: boolean;
	chat_bot_messages: boolean;
	spawn_timeout: number;
	block_place_delay: number;
	log_all_prompts: boolean;
	[key: string]: unknown;
}

// どのファイルからもimport/変更可能な軽量設定オブジェクト
const settings = {} as Settings;
export default settings;

/**
 * @description 設定を新しい値で完全に置き換える
 * @param new_settings - 新しい設定値
 */
export function setSettings(new_settings: Partial<Settings>): void {
	for (const key of Object.keys(settings)) {
		delete (settings as Record<string, unknown>)[key];
	}
	Object.assign(settings, new_settings);
}
