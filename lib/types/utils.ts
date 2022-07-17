export type OmitFirstArrayIndex<T> = T extends [any, ...infer Rest] ? Rest : never;
