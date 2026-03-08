/**
 * @description 2つのベクトル間のコサイン類似度を計算
 * @param a - ベクトルA
 * @param b - ベクトルB
 * @returns コサイン類似度 (-1 ~ 1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
	let dotProduct = 0;
	let magnitudeA = 0;
	let magnitudeB = 0;
	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i]; // calculate dot product
		magnitudeA += Math.pow(a[i], 2); // calculate magnitude of a
		magnitudeB += Math.pow(b[i], 2); // calculate magnitude of b
	}
	magnitudeA = Math.sqrt(magnitudeA);
	magnitudeB = Math.sqrt(magnitudeB);
	return dotProduct / (magnitudeA * magnitudeB); // calculate cosine similarity
}
