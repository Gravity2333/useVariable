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
import { observe } from './utils/watch';
export default function useStore<StoreValueType extends StoreObject>({
  config = [],
}: {
  config: StoreConfig[];
}) {
  // 更新hooks
  const [updater] = useForceUpdate();
  const store = useRef<Record<string, any>>(
    observe(
      config.reduce((mergedValues, currentConfig) => {
        return {
          ...mergedValues,
          [currentConfig.name]:
            currentConfig.initialValue !== undefined ? currentConfig.initialValue : {},
        };
      }, {}),
      // onSet
      updater,
      // onGet
      () => {},
      // onDeleteProperty
      updater,
    ),
  );

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

  const _handleReducer = (reducer: Reducer, name: Type, payload: any) => {
    const storeSlice = store.current[name];
    reducer(storeSlice, { payload });
  };

  const _handleEffect = (effect: Effect, name: Type, type: Type, payload: any) => {
    const storeSlice = store.current[name];
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

  const dispatch: Dispatch = ({ type, payload }) => {
    const [name, actionType] = type.split(USE_STORE_TYPE_SPLITER);
    const configItem = configMap[name];
    const { reducers = {}, effects = {} } = configItem;
    if (effects[actionType]) {
      _handleEffect(effects[actionType], name, type, payload);
    } else if (reducers[actionType]) {
      _handleReducer(reducers[actionType], name, payload);
    }
  };

  return [store.current, dispatch, getLoading] as [
    StoreValueType,
    Dispatch,
    (type: Type) => boolean,
  ];
}
export * from './typings';
