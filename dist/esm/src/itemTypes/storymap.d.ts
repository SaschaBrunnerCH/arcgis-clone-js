/**
 * Return a list of items this depends on
 */
export declare function getDependencies(model: any): Promise<string[]>;
/**
 * Cascade specific logic
 */
export declare function getCascadeDependencies(model: any): string[];
/**
 * Map Series specific logic
 */
export declare function getMapSeriesDependencies(model: any): string[];
export declare function getMapJournalDependencies(model: any): string[];
