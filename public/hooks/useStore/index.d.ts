import { StoreConfig, StoreObject, Type, Dispatch } from './typings';
export default function useStore<StoreValueType extends StoreObject>({ config, }: {
    config: StoreConfig[];
}): [StoreValueType, Dispatch, (type: Type) => boolean, () => void];
export * from './typings';
