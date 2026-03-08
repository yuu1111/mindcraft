import type MinecraftData from "minecraft-data";
import minecraftData from "minecraft-data";
import type { Bot } from "mineflayer";
import { createBot } from "mineflayer";
import plugin from "mineflayer-armor-manager";
import { loader as autoEat } from "mineflayer-auto-eat";
import { plugin as collectblock } from "mineflayer-collectblock";
import { pathfinder } from "mineflayer-pathfinder";
import { plugin as pvp } from "mineflayer-pvp";
import prismarine_items from "prismarine-item";
import settings from "../agent/settings.js";

const armorManager = plugin;
let mc_version: string = settings.minecraft_version;
let mcdata: MinecraftData.IndexedData | null = null;
let Item: (new (type: number, count: number) => InstanceType<ReturnType<typeof prismarine_items>>) | null = null;

/**
 * @internal
 * @description 初期化済みのmcdataを取得(未初期化時はエラー)
 * @returns minecraft-dataのIndexedData
 */
function getMcData(): MinecraftData.IndexedData {
	if (!mcdata) {
		throw new Error("mcdata is not initialized. Call initBot() first.");
	}
	return mcdata;
}

/**
 * @description Minecraftの木材タイプ一覧
 */
export const WOOD_TYPES = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry"] as const;

/**
 * @description 木材タイプに対応するブロック種別
 */
export const MATCHING_WOOD_BLOCKS = [
	"log",
	"planks",
	"sign",
	"boat",
	"fence_gate",
	"door",
	"fence",
	"slab",
	"stairs",
	"button",
	"pressure_plate",
	"trapdoor",
] as const;

/**
 * @description 羊毛の色一覧
 */
export const WOOL_COLORS = [
	"white",
	"orange",
	"magenta",
	"light_blue",
	"yellow",
	"lime",
	"pink",
	"gray",
	"light_gray",
	"cyan",
	"purple",
	"blue",
	"brown",
	"green",
	"red",
	"black",
] as const;

/**
 * @description mineflayerボットを初期化しプラグインを読み込む
 * @param username - ボットのユーザー名
 * @returns 初期化されたBotインスタンス
 */
export function initBot(username: string): Bot {
	const options: Parameters<typeof createBot>[0] = {
		username: username,
		host: settings.host,
		port: settings.port,
		auth: settings.auth as "offline" | "microsoft",
		version: mc_version || undefined,
	};
	if (!mc_version || mc_version === "auto") {
		delete options.version;
	}

	const bot = createBot(options);
	bot.loadPlugin(pathfinder);
	bot.loadPlugin(pvp);
	bot.loadPlugin(collectblock);
	bot.loadPlugin(autoEat);
	bot.loadPlugin(armorManager);
	bot.once("resourcePack", () => {
		bot.acceptResourcePack();
	});

	bot.once("login", () => {
		mc_version = bot.version;
		mcdata = minecraftData(mc_version);
		Item = prismarine_items(mc_version) as any;
	});

	return bot;
}

/**
 * @description mobが狩猟可能な動物かどうか判定
 * @param mob - 対象のエンティティ
 * @returns 狩猟可能ならtrue
 */
export function isHuntable(mob: any): boolean {
	if (!mob || !mob.name) return false;
	const animals = ["chicken", "cow", "llama", "mooshroom", "pig", "rabbit", "sheep"];
	return animals.includes(mob.name.toLowerCase()) && !mob.metadata[16];
}

/**
 * @description mobが敵対的かどうか判定
 * @param mob - 対象のエンティティ
 * @returns 敵対的ならtrue
 */
export function isHostile(mob: any): boolean {
	if (!mob || !mob.name) return false;
	return (mob.type === "mob" || mob.type === "hostile") && mob.name !== "iron_golem" && mob.name !== "snow_golem";
}

/**
 * @description collectBlockで収集できず手動収集が必要なブロックか判定
 * @param blockName - ブロック名
 * @returns 手動収集が必要ならtrue
 */
export function mustCollectManually(blockName: string): boolean {
	const full_names = [
		"wheat",
		"carrots",
		"potatoes",
		"beetroots",
		"nether_wart",
		"cocoa",
		"sugar_cane",
		"kelp",
		"short_grass",
		"fern",
		"tall_grass",
		"bamboo",
		"poppy",
		"dandelion",
		"blue_orchid",
		"allium",
		"azure_bluet",
		"oxeye_daisy",
		"cornflower",
		"lilac",
		"wither_rose",
		"lily_of_the_valley",
		"wither_rose",
		"lever",
		"redstone_wire",
		"lantern",
	];
	const partial_names = [
		"sapling",
		"torch",
		"button",
		"carpet",
		"pressure_plate",
		"mushroom",
		"tulip",
		"bush",
		"vines",
		"fern",
	];
	return (
		full_names.includes(blockName.toLowerCase()) ||
		partial_names.some((partial) => blockName.toLowerCase().includes(partial))
	);
}

/**
 * @description アイテム名からIDを取得
 * @param itemName - アイテム名
 * @returns アイテムID、見つからなければnull
 */
export function getItemId(itemName: string): number | null {
	const item = getMcData().itemsByName[itemName];
	if (item) {
		return item.id;
	}
	return null;
}

/**
 * @description アイテムIDから名前を取得
 * @param itemId - アイテムID
 * @returns アイテム名、見つからなければnull
 */
export function getItemName(itemId: number): string | null {
	const item = getMcData().items[itemId];
	if (item) {
		return item.name;
	}
	return null;
}

/**
 * @description ブロック名からIDを取得
 * @param blockName - ブロック名
 * @returns ブロックID、見つからなければnull
 */
export function getBlockId(blockName: string): number | null {
	const block = getMcData().blocksByName[blockName];
	if (block) {
		return block.id;
	}
	return null;
}

/**
 * @description ブロックIDから名前を取得
 * @param blockId - ブロックID
 * @returns ブロック名、見つからなければnull
 */
export function getBlockName(blockId: number): string | null {
	const block = getMcData().blocks[blockId];
	if (block) {
		return block.name;
	}
	return null;
}

/**
 * @description エンティティ名からIDを取得
 * @param entityName - エンティティ名
 * @returns エンティティID、見つからなければnull
 */
export function getEntityId(entityName: string): number | null {
	const entity = getMcData().entitiesByName[entityName];
	if (entity) {
		return entity.id;
	}
	return null;
}

/**
 * @description 全アイテムを取得(指定アイテムを除外可能)
 * @param ignore - 除外するアイテム名の配列
 * @returns アイテム配列
 */
export function getAllItems(ignore: string[] = []): MinecraftData.Item[] {
	const data = getMcData();
	const items: MinecraftData.Item[] = [];
	for (const itemId in data.items) {
		const item = data.items[itemId];
		if (!ignore.includes(item.name)) {
			items.push(item);
		}
	}
	return items;
}

/**
 * @description 全アイテムIDを取得(指定アイテムを除外可能)
 * @param ignore - 除外するアイテム名の配列
 * @returns アイテムID配列
 */
export function getAllItemIds(ignore?: string[]): number[] {
	const items = getAllItems(ignore);
	const itemIds: number[] = [];
	for (const item of items) {
		itemIds.push(item.id);
	}
	return itemIds;
}

/**
 * @description 全ブロックを取得(指定ブロックを除外可能)
 * @param ignore - 除外するブロック名の配列
 * @returns ブロック配列
 */
export function getAllBlocks(ignore: string[] = []): MinecraftData.Block[] {
	const data = getMcData();
	const blocks: MinecraftData.Block[] = [];
	for (const blockId in data.blocks) {
		const block = data.blocks[blockId];
		if (!ignore.includes(block.name)) {
			blocks.push(block as MinecraftData.Block);
		}
	}
	return blocks;
}

/**
 * @description 全ブロックIDを取得(指定ブロックを除外可能)
 * @param ignore - 除外するブロック名の配列
 * @returns ブロックID配列
 */
export function getAllBlockIds(ignore?: string[]): number[] {
	const blocks = getAllBlocks(ignore);
	const blockIds: number[] = [];
	for (const block of blocks) {
		blockIds.push(block.id);
	}
	return blockIds;
}

/**
 * @description 全バイオームを取得
 * @returns バイオームの辞書
 */
export function getAllBiomes(): { [id: number]: MinecraftData.Biome } {
	return getMcData().biomes;
}

/**
 * @description アイテムのクラフトレシピを取得
 * @param itemName - アイテム名
 * @returns レシピ配列、見つからなければnull
 */
export function getItemCraftingRecipes(itemName: string): [Record<string, number>, { craftedCount: number }][] | null {
	const data = getMcData();
	const itemId = getItemId(itemName);
	if (itemId === null || !data.recipes[itemId]) {
		return null;
	}

	const recipes: [Record<string, number>, { craftedCount: number }][] = [];
	for (const r of data.recipes[itemId]) {
		const recipe: Record<string, number> = {};
		let ingredients: any[] = [];
		if ("ingredients" in r) {
			ingredients = r.ingredients as any[];
		} else if ("inShape" in r) {
			ingredients = (r.inShape as any[][]).flat();
		}
		for (const ingredient of ingredients) {
			const ingredientName = getItemName(ingredient);
			if (ingredientName === null) continue;
			if (!recipe[ingredientName]) recipe[ingredientName] = 0;
			recipe[ingredientName]++;
		}
		recipes.push([recipe, { craftedCount: (r.result as any).count }]);
	}
	const commonItems = ["oak_planks", "oak_log", "coal", "cobblestone"];
	recipes.sort((a, b) => {
		const commonCountA = Object.keys(a[0])
			.filter((key) => commonItems.includes(key))
			.reduce((acc, key) => acc + a[0][key], 0);
		const commonCountB = Object.keys(b[0])
			.filter((key) => commonItems.includes(key))
			.reduce((acc, key) => acc + b[0][key], 0);
		return commonCountB - commonCountA;
	});

	return recipes;
}

/**
 * @description アイテムが精錬可能かどうか判定
 * @param itemName - アイテム名
 * @returns 精錬可能ならtrue
 */
export function isSmeltable(itemName: string): boolean {
	const misc_smeltables = [
		"beef",
		"chicken",
		"cod",
		"mutton",
		"porkchop",
		"rabbit",
		"salmon",
		"tropical_fish",
		"potato",
		"kelp",
		"sand",
		"cobblestone",
		"clay_ball",
	];
	return itemName.includes("raw") || itemName.includes("log") || misc_smeltables.includes(itemName);
}

/**
 * @description ボットのインベントリから精錬燃料を検索
 * @param bot - mineflayerボット
 * @returns 燃料アイテム、見つからなければundefined
 */
export function getSmeltingFuel(bot: Bot): any {
	let fuel = bot.inventory.items().find((i) => i.name === "coal" || i.name === "charcoal" || i.name === "blaze_rod");
	if (fuel) return fuel;
	fuel = bot.inventory.items().find((i) => i.name.includes("log") || i.name.includes("planks"));
	if (fuel) return fuel;
	return bot.inventory.items().find((i) => i.name === "coal_block" || i.name === "lava_bucket");
}

/**
 * @description 燃料1個あたりの精錬回数を取得
 * @param fuelName - 燃料アイテム名
 * @returns 精錬回数
 */
export function getFuelSmeltOutput(fuelName: string): number {
	if (fuelName === "coal" || fuelName === "charcoal") return 8;
	if (fuelName === "blaze_rod") return 12;
	if (fuelName.includes("log") || fuelName.includes("planks")) return 1.5;
	if (fuelName === "coal_block") return 80;
	if (fuelName === "lava_bucket") return 100;
	return 0;
}

/**
 * @description 精錬結果アイテムから原材料名を取得
 * @param itemName - 精錬結果アイテム名
 * @returns 原材料名、マッピングがなければundefined
 */
export function getItemSmeltingIngredient(itemName: string): string | undefined {
	return (
		{
			baked_potato: "potato",
			steak: "raw_beef",
			cooked_chicken: "raw_chicken",
			cooked_cod: "raw_cod",
			cooked_mutton: "raw_mutton",
			cooked_porkchop: "raw_porkchop",
			cooked_rabbit: "raw_rabbit",
			cooked_salmon: "raw_salmon",
			dried_kelp: "kelp",
			iron_ingot: "raw_iron",
			gold_ingot: "raw_gold",
			copper_ingot: "raw_copper",
			glass: "sand",
		} as Record<string, string>
	)[itemName];
}

/**
 * @description アイテムをドロップするブロックのソースを取得
 * @param itemName - アイテム名
 * @returns ブロック名の配列
 */
export function getItemBlockSources(itemName: string): string[] {
	const itemId = getItemId(itemName);
	const sources: string[] = [];
	for (const block of getAllBlocks()) {
		if ((block.drops as any[]).includes(itemId)) {
			sources.push(block.name);
		}
	}
	return sources;
}

/**
 * @description アイテムをドロップする動物のソースを取得
 * @param itemName - アイテム名
 * @returns 動物名、マッピングがなければundefined
 */
export function getItemAnimalSource(itemName: string): string | undefined {
	return (
		{
			raw_beef: "cow",
			raw_chicken: "chicken",
			raw_cod: "cod",
			raw_mutton: "sheep",
			raw_porkchop: "pig",
			raw_rabbit: "rabbit",
			raw_salmon: "salmon",
			leather: "cow",
			wool: "sheep",
		} as Record<string, string>
	)[itemName];
}

/**
 * @description ブロックの採掘に必要なツールを取得
 * @param blockName - ブロック名
 * @returns ツール名、不要ならnull
 */
export function getBlockTool(blockName: string): string | null {
	const block = getMcData().blocksByName[blockName];
	if (!block || !block.harvestTools) {
		return null;
	}
	return getItemName(Number(Object.keys(block.harvestTools)[0]));
}

/**
 * @description 指定アイテムのItemインスタンスを生成
 * @param name - アイテム名
 * @param amount - 個数
 * @returns Itemインスタンス
 */
export function makeItem(name: string, amount = 1): any {
	if (!Item) {
		throw new Error("Item class is not initialized. Call initBot() first.");
	}
	return new Item(getItemId(name)!, amount);
}

/**
 * @description prismarineレシピから必要な材料を計算
 * @param recipe - prismarineレシピオブジェクト
 * @returns 材料名と必要数のマップ
 */
export function ingredientsFromPrismarineRecipe(recipe: any): Record<string, number> {
	const requiredIngedients: Record<string, number> = {};
	if (recipe.inShape)
		for (const ingredient of recipe.inShape.flat()) {
			if (ingredient.id < 0) continue;
			const ingredientName = getItemName(ingredient.id);
			if (ingredientName === null) continue;
			requiredIngedients[ingredientName] ??= 0;
			requiredIngedients[ingredientName] += ingredient.count;
		}
	if (recipe.ingredients)
		for (const ingredient of recipe.ingredients) {
			if (ingredient.id < 0) continue;
			const ingredientName = getItemName(ingredient.id);
			if (ingredientName === null) continue;
			requiredIngedients[ingredientName] ??= 0;
			// `-=`は意図的。prismarineはshaped材料に正の値、unshaped材料に負の値を使用
			requiredIngedients[ingredientName] -= ingredient.count;
		}
	return requiredIngedients;
}

/**
 * @description 利用可能リソースからアクション実行可能回数と制約リソースを計算
 * @param availableItems - 利用可能リソースのマップ
 * @param requiredItems - アクション1回に必要なリソースのマップ
 * @param discrete - 離散値として扱うか
 * @returns 実行可能回数と制約リソース
 */
export function calculateLimitingResource(
	availableItems: Record<string, number>,
	requiredItems: Record<string, number>,
	discrete = true,
): { num: number; limitingResource: string | null } {
	let limitingResource: string | null = null;
	let num = Infinity;
	for (const itemType in requiredItems) {
		if (availableItems[itemType] < requiredItems[itemType] * num) {
			limitingResource = itemType;
			num = availableItems[itemType] / requiredItems[itemType];
		}
	}
	if (discrete) num = Math.floor(num);
	return { num, limitingResource };
}

let loopingItems = new Set<string>();

/**
 * @description クラフトループを引き起こすアイテムセットを初期化
 */
export function initializeLoopingItems(): void {
	loopingItems = new Set([
		"coal",
		"wheat",
		"bone_meal",
		"diamond",
		"emerald",
		"raw_iron",
		"raw_gold",
		"redstone",
		"blue_wool",
		"packed_mud",
		"raw_copper",
		"iron_ingot",
		"dried_kelp",
		"gold_ingot",
		"slime_ball",
		"black_wool",
		"quartz_slab",
		"copper_ingot",
		"lapis_lazuli",
		"honey_bottle",
		"rib_armor_trim_smithing_template",
		"eye_armor_trim_smithing_template",
		"vex_armor_trim_smithing_template",
		"dune_armor_trim_smithing_template",
		"host_armor_trim_smithing_template",
		"tide_armor_trim_smithing_template",
		"wild_armor_trim_smithing_template",
		"ward_armor_trim_smithing_template",
		"coast_armor_trim_smithing_template",
		"spire_armor_trim_smithing_template",
		"snout_armor_trim_smithing_template",
		"shaper_armor_trim_smithing_template",
		"netherite_upgrade_smithing_template",
		"raiser_armor_trim_smithing_template",
		"sentry_armor_trim_smithing_template",
		"silence_armor_trim_smithing_template",
		"wayfinder_armor_trim_smithing_template",
	]);
}

/**
 * @description 現在のインベントリを考慮したクラフト計画を生成
 * @param targetItem - 目標アイテム名
 * @param count - 必要個数
 * @param current_inventory - 現在のインベントリ
 * @returns クラフト計画の文字列
 */
export function getDetailedCraftingPlan(
	targetItem: string,
	count = 1,
	current_inventory: Record<string, number> = {},
): string {
	initializeLoopingItems();
	if (!targetItem || count <= 0 || !getItemId(targetItem)) {
		return "Invalid input. Please provide a valid item name and positive count.";
	}

	if (isBaseItem(targetItem)) {
		const available = current_inventory[targetItem] || 0;
		if (available >= count) return "You have all required items already in your inventory!";
		return `${targetItem} is a base item, you need to find ${count - available} more in the world`;
	}

	const inventory = { ...current_inventory };
	const leftovers: Record<string, number> = {};
	const plan = craftItem(targetItem, count, inventory, leftovers);
	return formatPlan(targetItem, plan);
}

/**
 * @internal
 * @description アイテムがベースアイテム(これ以上分解不可)かどうか判定
 * @param item - アイテム名
 * @returns ベースアイテムならtrue
 */
function isBaseItem(item: string): boolean {
	return loopingItems.has(item) || getItemCraftingRecipes(item) === null;
}

/**
 * @description クラフト計画の内部データ構造
 * @property required - 不足している材料
 * @property steps - クラフト手順
 * @property leftovers - 余剰アイテム
 */
interface CraftPlan {
	required: Record<string, number>;
	steps: string[];
	leftovers: Record<string, number>;
}

/**
 * @internal
 * @description 再帰的にクラフト計画を構築
 * @param item - 目標アイテム名
 * @param count - 必要個数
 * @param inventory - 現在のインベントリ
 * @param leftovers - 余剰アイテム
 * @param crafted - 構築中のクラフト計画
 * @returns 更新されたクラフト計画
 */
function craftItem(
	item: string,
	count: number,
	inventory: Record<string, number>,
	leftovers: Record<string, number>,
	crafted: CraftPlan = { required: {}, steps: [], leftovers: {} },
): CraftPlan {
	const availableInv = inventory[item] || 0;
	const availableLeft = leftovers[item] || 0;
	const totalAvailable = availableInv + availableLeft;

	if (totalAvailable >= count) {
		const useFromLeft = Math.min(availableLeft, count);
		leftovers[item] = availableLeft - useFromLeft;

		const remainingNeeded = count - useFromLeft;
		if (remainingNeeded > 0) {
			inventory[item] = availableInv - remainingNeeded;
		}
		return crafted;
	}

	const stillNeeded = count - totalAvailable;
	if (availableLeft > 0) leftovers[item] = 0;
	if (availableInv > 0) inventory[item] = 0;

	if (isBaseItem(item)) {
		crafted.required[item] = (crafted.required[item] || 0) + stillNeeded;
		return crafted;
	}

	const recipe = getItemCraftingRecipes(item)?.[0];
	if (!recipe) {
		crafted.required[item] = stillNeeded;
		return crafted;
	}

	const [ingredients, result] = recipe;
	const craftedPerRecipe = result.craftedCount;
	const batchCount = Math.ceil(stillNeeded / craftedPerRecipe);
	const totalProduced = batchCount * craftedPerRecipe;

	if (totalProduced > stillNeeded) {
		leftovers[item] = (leftovers[item] || 0) + (totalProduced - stillNeeded);
	}

	for (const [ingredientName, ingredientCount] of Object.entries(ingredients)) {
		const totalIngredientNeeded = ingredientCount * batchCount;
		craftItem(ingredientName, totalIngredientNeeded, inventory, leftovers, crafted);
	}

	const stepIngredients = Object.entries(ingredients)
		.map(([name, amount]) => `${amount * batchCount} ${name}`)
		.join(" + ");
	crafted.steps.push(`Craft ${stepIngredients} -> ${totalProduced} ${item}`);

	return crafted;
}

/**
 * @internal
 * @description クラフト計画を人間が読める文字列にフォーマット
 * @param targetItem - 目標アイテム名
 * @param plan - クラフト計画データ
 * @returns フォーマット済み文字列
 */
function formatPlan(targetItem: string, { required, steps, leftovers }: CraftPlan): string {
	const lines: string[] = [];

	if (Object.keys(required).length > 0) {
		lines.push("You are missing the following items:");
		Object.entries(required).forEach(([item, count]) => lines.push(`- ${count} ${item}`));
		lines.push("\nOnce you have these items, here's your crafting plan:");
	} else {
		lines.push("You have all items required to craft this item!");
		lines.push("Here's your crafting plan:");
	}

	lines.push("");
	lines.push(...steps);

	if (Object.keys(required).some((item) => item.includes("oak")) && !targetItem.includes("oak")) {
		lines.push("Note: Any varient of wood can be used for this recipe.");
	}

	if (Object.keys(leftovers).length > 0) {
		lines.push("\nYou will have leftover:");
		Object.entries(leftovers).forEach(([item, count]) => lines.push(`- ${count} ${item}`));
	}

	return lines.join("\n");
}
