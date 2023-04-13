import axios from "axios";
import { Message } from "element-ui";

// 给所有axios请求设置基础的域名
// axios.defaults.baseURL = 'http://localhost:3000'

// 根据 process.env.NODE_ENV 切换不同的 baseURL
// const isPro = process.env.NODE_ENV === 'production'
// baseURL = isPro ? 'http://192.168.100.120/ceds' : '/apis'   开发环境用/api 配置代理，生产环境直接换成完整接口地址(也可以不用，看是否跨域)
// const isPro = process.env.NODE_ENV === 'production'

const baseURL2 = "/apis2"; // http://192.168.20.31:18200





const axiosEks = axios.create({
  baseURL: baseURL2 + "/EmergencyPlanKnowledgeService",
  timeout: 10000,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});






export {
  axiosEks,
  
};
