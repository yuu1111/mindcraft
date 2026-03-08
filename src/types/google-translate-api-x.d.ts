declare module "google-translate-api-x" {
	interface TranslationResult {
		text: string;
		from: {
			language: {
				didYouMean: boolean;
				iso: string;
			};
			text: {
				autoCorrected: boolean;
				value: string;
				didYouMean: boolean;
			};
		};
	}

	interface TranslateOptions {
		to?: string;
		from?: string;
	}

	function translate(text: string, options?: TranslateOptions): Promise<TranslationResult>;
	export default translate;
}
