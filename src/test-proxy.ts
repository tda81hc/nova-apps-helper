import https from "https"; // ES module import style in TS
import { HttpsProxyAgent } from "https-proxy-agent";

const proxy = "http://127.0.0.1:3128"; // 👈 replace with actual Bosch proxy
const agent = new HttpsProxyAgent(proxy);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const options: https.RequestOptions = {
  method: "GET",
  hostname: "nova-dev.aid.bosch.com",
  path: "/api/v1/process-model/processes",
  headers: {
    cookie: "JSESSIONID=78AE58DC2D7C4C5F0D1211018A8DBDBF",
    "nova-tenant-id": "07c8df4c-c3bd-4d8d-9778-93f2d17a15a5",
  },
  agent,
};

const req = https.request(options, (res) => {
  const chunks: Uint8Array[] = [];

  res.on("data", (chunk) => {
    chunks.push(chunk);
  });

  res.on("end", () => {
    const body = Buffer.concat(chunks).toString();
    console.log(body);
  });
});

req.on("error", (err) => {
  console.error("Request error:", err);
});

req.end();
