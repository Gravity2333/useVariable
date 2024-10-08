import { useMemo } from 'react';
import useStore from './hooks/useStore';
import { Dispatch, StoreObject, Type } from './hooks/useStore/typings';
import { UseVariableParams } from './typings';
import {
  _GeneraterDefaultSetterName,
  _GenerateStoreConfig,
  _GenerateStoreReducerName,
  VARIABLE_STORE_NAME,
} from './utils';

/** 对useStore一层封装，简化其配置 */
export default function useVariable<VariableTypes extends StoreObject>(
  useVariableParams: UseVariableParams,
) {
  const [{ [VARIABLE_STORE_NAME]: useStoreValue }, useStoreDispatch, useStoreLoading] =
    useStore<VariableTypes>({
      config: [_GenerateStoreConfig(useVariableParams)],
    });

  const dispatch = (action: { type: Type; payload?: any }) => {
    useStoreDispatch({
      type: _GenerateStoreReducerName(action.type),
      payload: action.payload,
    });
  };

  const loading = (type: Type) => {
    return useStoreLoading(_GenerateStoreReducerName(type));
  };

  const variables = useMemo(() => {
    return new Proxy(useStoreValue, {
      get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        return res;
      },
      set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        dispatch({ type: _GeneraterDefaultSetterName(key as string), payload: value });
        return res;
      },
      deleteProperty(target, key) {
        const res = Reflect.deleteProperty(target, key);
        return res;
      },
    });
  }, []);

  return [variables, dispatch, loading] as [VariableTypes, Dispatch, (type: Type) => boolean];
}

export * from './typings'
export * from './hooks/useStore'
export * from './hooks/useForceUpdate'
