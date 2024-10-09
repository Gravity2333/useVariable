type SetCallback = (target: Record<string, any>, p: string | symbol, newValue: any, receiver: any) => void;
type GetCallback = (target: any, p: string | symbol, receiver: any) => void;
type DeleteCallback = (target: any, p: string | symbol) => void;
/** 监听函数 */
export declare function observe(obj: Record<string, any>, onSet?: SetCallback, onGet?: GetCallback, onDeleteProperty?: DeleteCallback): Record<string, any>;
export {};
