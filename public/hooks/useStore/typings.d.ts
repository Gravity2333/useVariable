import type { Call } from './libs/task';
/** 存储对象 */
export type StoreObject = Record<Type, any>;
/** 类型 */
export type Type = string;
/** action对象 */
export type Action = {
    type?: Type;
    payload?: any;
};
/** reducer函数 */
export type Reducer = (state: StoreObject, action: Action) => StoreObject;
/** dispatch函数 */
export type Dispatch = (action: {
    type: Type;
    payload?: any;
}) => void;
/** 副作用 */
export type Effect = (_operators: {
    call: Call;
    setLoading: (loading: boolean) => void;
}, _store: {
    store: StoreObject;
    dispatch: Dispatch;
}, payload?: any) => void;
/** 仓库配置 */
export type StoreConfig = {
    name: string;
    /** 初始值 */
    initialValue?: StoreObject;
    /** 归纳器 */
    reducers?: Record<Type, Reducer>;
    /** 副作用 */
    effects?: Record<Type, Effect>;
};
export declare const USE_STORE_TYPE_SPLITER = "/";
