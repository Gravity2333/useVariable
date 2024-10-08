import { Dispatch, StoreObject, Type } from './hooks/useStore/typings';
import { UseVariableParams } from './typings';
/** 对useStore一层封装，简化其配置 */
export default function useVariable<VariableTypes extends StoreObject>(useVariableParams: UseVariableParams): [VariableTypes, Dispatch, (type: Type) => boolean];
