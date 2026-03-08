import translate from "google-translate-api-x";
import settings from "../agent/settings.js";

/**
 * @description メッセージをユーザーの優先言語に翻訳
 * @param message - 翻訳対象メッセージ
 * @returns 翻訳済みメッセージ(英語の場合はそのまま返す)
 */
export async function handleTranslation(message: string): Promise<string> {
	const preferred_lang = String(settings.language).toLowerCase();
	if (!preferred_lang || preferred_lang === "en" || preferred_lang === "english") return message;
	try {
		const translation = await translate(message, { to: preferred_lang });
		return translation.text || message;
	} catch (error) {
		console.error("Error translating message:", error);
		return message;
	}
}

/**
 * @description メッセージを英語に翻訳
 * @param message - 翻訳対象メッセージ
 * @returns 英語に翻訳されたメッセージ
 */
export async function handleEnglishTranslation(message: string): Promise<string> {
	const preferred_lang = String(settings.language).toLowerCase();
	if (!preferred_lang || preferred_lang === "en" || preferred_lang === "english") return message;
	try {
		const translation = await translate(message, { to: "english" });
		return translation.text || message;
	} catch (error) {
		console.error("Error translating message:", error);
		return message;
	}
}
