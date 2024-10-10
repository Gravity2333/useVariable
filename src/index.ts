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
  const [_store, _storeDispatch, _storeLoading] = useStore<VariableTypes>({
    config: [_GenerateStoreConfig(useVariableParams)],
  });

  const dispatch = (action: { type: Type; payload?: any }) => {
    return _storeDispatch({
      type: _GenerateStoreReducerName(action.type),
      payload: action.payload,
    },dispatch);
  };

  const loading = (type: Type) => {
    return _storeLoading(_GenerateStoreReducerName(type));
  };

  return [_store[VARIABLE_STORE_NAME], dispatch, loading] as [VariableTypes, Dispatch, (type: Type) => boolean];
}

export * from './typings';
export * from './hooks/useStore';
export * from './hooks/useForceUpdate';
