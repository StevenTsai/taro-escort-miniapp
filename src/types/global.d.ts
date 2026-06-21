/// <reference types="@tarojs/taro" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** API 基础地址 */
    TARO_APP_API: string;
    /** COS 存储桶基础地址 */
    TARO_APP_COS_BASE: string;
    /** 腾讯云开发环境 ID */
    TARO_APP_CLOUD_ENV: string;
  }
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
