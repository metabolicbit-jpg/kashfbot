const fs=require("fs");
let s=fs.readFileSync("index.js","utf8");
s=s.replace(/`(?:\\.|[^`\\])*`/g,"``")
   .replace(/"(?:\\.|[^"\\])*"/g,'""')
   .replace(/'(?:\\.|[^'\\])*'/g,"''")
   .replace(/\/\/[^\n]*/g,"");
let d=0;const bad=[];const re=/async function ([A-Za-z0-9_]+)|[{}]/g;let m;
while((m=re.exec(s))){if(m[1]!==undefined){if(d!==0)bad.push(m[1]+"(depth "+d+")");}else if(m[0]==="{")d++;else d--;}
if(bad.length||d!==0){console.log("❌ توابع تودرتو/نامتوازن:",bad.join(", ")||"-","| عمق نهایی:",d);process.exit(1);}
console.log("✅ همه توابع در سطح بالا و براکت‌ها متوازن");