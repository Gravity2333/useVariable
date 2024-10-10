export type Call = (asyncFunc: (...args: any[]) => Promise<any>, payload?: any) => any;
type Task = (call: Call, resolve: (value: any) => void, reject: (value: any) => void) => void;
export declare function runTask(task: Task): Promise<unknown>;
export {};
