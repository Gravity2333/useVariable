import { StoreConfig } from "../hooks/useStore/typings";
import { UseVariableParams } from "../typings";
export declare function capitalizeFirstLetter(str: string): string;
export declare const VARIABLE_STORE_NAME = "VARIABLES";
export declare function _GenerateStoreReducerName(reducerName: string): string;
export declare function _GeneraterDefaultSetterName(variableName: string): string;
/** 生成useStore参数内容 */
export declare function _GenerateStoreConfig(variableParams: UseVariableParams): StoreConfig;
