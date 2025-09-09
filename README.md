# 氦狗金融项目程序

- packages/api 统一 API 管理
- packages/mini-program 小程序端

### packages/api

包含跨端api模块

```ts
// 在其他模块中使用
import {Api} from "@higoal/api";

function launcher(url, options) {
  // 你的实际实现

  return {
    get,
    post,
    put,
    delete
  }
}

const api = new Api(launcher)

//调用
await api.login({code:"", phoneCode:""})
```

### packages/mini-program

包含小程序端
