export type Call = (asyncFunc: (...args: any[]) => Promise<any>, payload?: any) => any;
type Task = (call: Call) => void;
export declare function runTask(task: Task): void;
export {};
