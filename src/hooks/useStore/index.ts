import { useMemo, useRef, useState } from 'react';
import {
  StoreConfig,
  StoreObject,
  Type,
  Dispatch,
  USE_STORE_TYPE_SPLITER,
  Reducer,
  Effect,
} from './typings';
import { runTask } from './libs/task';
import useForceUpdate from '../useForceUpdate';
export default function useStore<StoreValueType extends StoreObject>({
  config = [],
}: {
  config: StoreConfig[];
}) {
  const store = useRef<Record<string, any>>(
    config.reduce((mergedValues, currentConfig) => {
      return {
        ...mergedValues,
        [currentConfig.name]:
          currentConfig.initialValue !== undefined ? currentConfig.initialValue : {},
      };
    }, {}),
  );

  const [updater] = useForceUpdate();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  function setLoading(type: Type, value: boolean = false) {
    if (loadingMap[type] !== undefined) {
      setLoadingMap((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  }
  function getLoading(type: Type) {
    return loadingMap[type];
  }

  const configMap = useMemo(() => {
    const _loadingMap: Record<string, boolean> = {};
    const maps =
      (config.reduce((currentConfigMap, currentConfig) => {
        if (Object.keys(currentConfig.effects || {})?.length !== 0) {
          Object.keys(currentConfig.effects || {}).forEach((effectName) => {
            _loadingMap[`${currentConfig.name}${USE_STORE_TYPE_SPLITER}${effectName}`] = false;
          });
        }
        return {
          ...currentConfigMap,
          [currentConfig.name]: currentConfig,
        };
      }, {}) as Record<string, StoreConfig>) || {};
    setLoadingMap(_loadingMap);
    return maps;
  }, []);

  const _handleReducer = (reducer: Reducer, name: Type, payload: any, receiver?: any) => {
    if (receiver) {
      const storeSlice = receiver;
      reducer(storeSlice, { payload });
    } else {
      const storeSlice = store.current[name];
      const newStoreSlice = reducer(storeSlice, { payload });
      Object.assign(storeSlice, newStoreSlice);
    }
    return updater();
  };

  const _handleEffect = (effect: Effect, name: Type, type: Type, payload: any, receiver?: any) => {
    const storeSlice = receiver || store.current[name];
    runTask((call) => {
      effect(
        {
          call,
          setLoading: setLoading.bind(null, type),
        },
        {
          store: storeSlice,
          dispatch,
        },
        payload,
      );
    });
  };

  const dispatch: Dispatch = ({ type, payload }, receiver) => {
    const [name, actionType] = type.split(USE_STORE_TYPE_SPLITER);
    const configItem = configMap[name];
    const { reducers = {}, effects = {} } = configItem;
    if (effects[actionType]) {
      _handleEffect(effects[actionType], name, type, payload, receiver);
    } else if (reducers[actionType]) {
      _handleReducer(reducers[actionType], name, payload, receiver);
    }
  };

  return [store.current, dispatch, getLoading, updater] as [
    StoreValueType,
    Dispatch,
    (type: Type) => boolean,
    () => void,
  ];
}
export * from './typings'
