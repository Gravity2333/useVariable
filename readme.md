### 实现一个简单的状态管理/处理副作用的 hook

此hook集成了类似于useReducer的状态管理，并且加入了副作用的处理，可以理解为一个组件内部的redux+thunk中间件。

如果你需要复杂的状态管理，并且不需要在多个组件/全局 共享此状态的话，可以考虑使用此hook

##### 使用方式：
```typescript
import useVariable from 'use-variable-hook'
// 声明状态数据类型
interface DataType {
  name: string
  infoList: any[]
}

// 配置状态&副作用
const variableConfig: UseVariableParams = {
  // 声明需要管理的状态和初始值
  variables: {
     name: ''
     infoList: []
  },
  // 声明副作用
  effects: {
    // 获取用户信息
    fetchuserInfo: ({ call, setLoading }, { store }, payload) => {
      // 设置loading信息，此信息可以通过useVariable返回的loading函数获取:
      // loading('fetchuserInfo')
      setLoading(true)
      // 调用call方法
      // 注意，fetchuserInfo方法为同步函数，不要在此使用async await 只需要假设call方法返回的就是用户数据即可！
      const { success, data } = call(queryUserInfoById, payload);
      const {name,infoList} = success ? data : [];
      // 使用同步的方式赋值即可
      // 这里使用proxy监听拦截store值的改变
      store.name = name
      store.infoList = infoList
      // 关闭loading
      setLoading(false);
    },
  },
};

export function UserInfoDisplayComponent({id}: {id: string}){
    // 调用useVariable hook管理用户信息
    const [{name,infoList}, dispatch, loading] = useVariable<DataType>(variableConfig);

    useEffect(()=>{
        dispatch({
            // 直接使用函数名作为type即可
            type: 'fetchuserInfo',
            payload: id
        })
    },[])

    // 使用loading(effect方法名)的方式获取loading状态
    return <Loadinglayout loading={loading('fetchuserInfo')}>
              <h2>用户姓名: {name}<h2>
              <h3>信息列表</h3>
              <ul>{infoList.map(info=><li key={info.id}>{info.data}</li>)}</ul>
           </Loadinglayout>
}

```

##### 修改状态

声明 variables 后，useVariable 会自动生成 useXXX 的 reducer 用来修改变量值 例如:

```javascript
// 声明变量
useVariable <
  DataType >
  {
    variables: {
      name: '',
      userInfo: [],
    },
  };
```

useVariable 会自动生成两个 reducer: setName , setUserInfo 其命名格式为 set+变量首字母大写可以直接使用: dispatch({type: 'setName', payload: '新的名称'})的方式修改变量值。

```javascript
// 修改变量“name”的值
dispatch({
  type: 'setName',
  payload: 'Jack',
});
```

##### 直接修改状态

如果你不想用 dispatch，你也可以采用更简便的方式修改，如下：

```javascript
// 声明变量
const [variables] =
  useVariable <
  DataType >
  {
    variables: {
      name: '',
      userInfo: [],
    },
  };

// 修改变量
variables.name = 'Jack';
```

useVariable 内部使用 proxy 监听 variable 对象属性的变动，会自动调用对应的 setXXX reducer 修改值。

注意 ⚠️： 你必须直接使用 “variables.属性” 的方式修改,如果你对 variables 进行了解构，将不会响应式更新数据

##### 自定义 reducer

useVariable 会自动生成 setXXX 的 reducer，但是如果你需要对数据进行一些复杂操作，其也支持自定义 reducer 的方式，可以在 config 对象内部直接定义 reducers 属性，其接受一个对象，key 为 reducer 名称，value 为 reducer 函数。reducer 函数定义如下：

```javascript
/** 存储对象 */
export type StoreObject = Record<Type, any>;

/** 类型 */
export type Type = string;

/** action对象 */
export type Action = {
  type?: Type,
  payload?: any,
};

/** reducer函数 */
export type Reducer = (store: StoreObject, action: Action) => StoreObject;
```

reducer 函数在调用的过程中，会传入当前的存储数据 store，以及当前 dispatch 的 action，你可以直接使用 store[属性名] = action.paylaod 的方式 如：

```javascript
// 需要手动修改姓名，并且在姓名后面自动加入 "(已修改)"字符串
reducers: {
  customChangeName: (store,action){
    store.name = action.payload + "(已修改)"
  }
}

// 使用dispatch修改name
dispatch({
  type: 'customChangeName',
  payload: 'Jack'
})

```

即可将姓名修改成 "Jack(已修改)"

##### 处理副作用

useVariable 内部采用代数效应思想，将异步请求部分抽离出去，你可以忘掉 async await！ 直接假设 call 函数返回的就是需要的业务数据即可！

```javascript
  // 声明副作用
  effects: {
    // 获取用户信息
    fetchuserInfo: ({ call, setLoading }, { store }, payload) => {
      setLoading(true)
      const { success, data } = call(queryUserInfoById, payload);
      const {name,infoList} = success ? data : [];
      store.name = name
      store.infoList = infoList
      // 关闭loading
      setLoading(false);
    },
  },
```

我们定义 fetchuserInfo 函数，这个函数的第一个参数内 包含函数 call 和 setLoading,其中 call 函数用来把异步函数转换成同步写法，其定义如下：

```javascript
type Call = (asyncFunc: (...args: any[]) => Promise<any>, payload?: any) => any;
```

第一个函数为一个返回 Promise 的异步函数，但是在这里你不需要用 await 等待，call 方法会把后面传入的参数一次传递给这个异步函数，并且直接返回请求结果，你只需要假设 call 方法直接返回业务数据即可！

这样设计有效避免了 async await 传染问题，在 effect 函数内部，你可以完全忽略数据的请求过程，专注业务逻辑，做到业务和实现的结偶。

具体实现原理可以见 /hooks/useStore/libs/task 采用抛出异常的方式暂停函数运行并且等待请求结果，在获得结果后缓存并且重新运行函数。

注意 ⚠️，effect 函数需要为纯函数，请不要在其内部加入 console 输出或者修改外部作用域等操作。
