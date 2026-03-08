declare module "prismarine-item" {
	function loader(mcVersion: string): typeof Item;

	class Item {
		constructor(type: number, count: number, metadata?: number, nbt?: object);
		type: number;
		count: number;
		metadata: number;
		nbt: object | null;
		name: string;
		displayName: string;
		stackSize: number;
	}

	export default loader;
}
