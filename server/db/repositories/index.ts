/**
 * Database repositories - data access layer.
 * 
 * All database operations go through these repositories.
 * This abstraction allows for easy migration between databases.
 */

export { categoriesRepository } from "./categories";
export type { Category } from "./categories";

export { storesRepository } from "./stores";
export type { Store } from "./stores";

export { itemsRepository } from "./items";
export type { Item } from "./items";

export { pricePointsRepository } from "./pricePoints";
export type { PricePoint, PricePointStats } from "./pricePoints";

export { isConnected, closePool } from "../connection";
