const crypto = require('crypto');
const secret = "VkYSYVwwVqxSQUkDs";
const header = { alg: 'HS256', typ: 'JWT' };
const payload = {
  "MapClaims": {
    "aud": "http://20.207.122.201/evaluation-service",
    "email": "jk6888@srmist.edu.in",
    "exp": Math.floor(Date.now() / 1000) + 3600,
    "iat": Math.floor(Date.now() / 1000),
    "iss": "Afford Medical Technologies Private Limited",
    "jti": "f9706536-9713-4057-903d-3e75891d546c",
    "locale": "en-IN",
    "name": "jeevesh kisalay",
    "sub": "855a30f6-8bf1-4b40-8c05-abd681fd5cd1"
  },
  "email": "jk6888@srmist.edu.in",
  "name": "jeevesh kisalay",
  "rollNo": "ra2311056010197",
  "accessCode": "QkbpxH",
  "clientID": "855a30f6-8bf1-4b40-8c05-abd681fd5cd1",
  "clientSecret": "VkYSYVwwVqxSQUkDs"
};

const base64url = (str) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', secret).update(encodedHeader + '.' + encodedPayload).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = encodedHeader + '.' + encodedPayload + '.' + signature;

console.log("Generated Token:", token);

globalThis.fetch("http://20.207.122.201/evaluation-service/notifications", {
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  }
}).then(res => {
  console.log("Status:", res.status);
  return res.text();
}).then(text => {
  console.log("Response:", text);
}).catch(console.error);
