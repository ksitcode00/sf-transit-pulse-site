// Feature 16A — Backend location / 后端地址
// 中文：网页只依赖这一项配置；未来方案 B 改为浏览器计算时，UI 数据契约无需改变。
// English: The UI depends on this single boundary. A future browser engine can
// return the same response contract without redesigning the product interface.
window.SF_TRANSIT_API_BASE = ["127.0.0.1", "localhost"].includes(window.location.hostname)
  ? "http://127.0.0.1:8000"
  : "https://sf-transit-planner-api-ksitcode00.onrender.com";
