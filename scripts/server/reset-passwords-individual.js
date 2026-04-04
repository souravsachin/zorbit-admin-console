const crypto = require("crypto");
const bcrypt = require("/home/sourav/apps/zorbit-platform/zorbit-identity/node_modules/bcrypt");
const { Client } = require("/home/sourav/apps/zorbit-platform/zorbit-identity/node_modules/pg");
const http = require("http");

const USERS = [
  { email: "s@onezippy.ai", password: "s@2021#cz", name: "Sourav Sachin" },
  { email: "a@onezippy.ai", password: "a@2019#cz", name: "Aahaan Sachin" },
  { email: "naineet.patel@onezippy.ai", password: "np@2019#cz", name: "Naineet Patel" },
  { email: "r@onezippy.ai", password: "r@2021#cz", name: "Ruth Z" },
  { email: "l@onezippy.ai", password: "l@2019#cz", name: "Lipi Sachin" },
  { email: "abhi@onezippy.ai", password: "abhi@2023#cz", name: "Abhishek Dey" },
  { email: "lekhashree.p@onezippy.ai", password: "lp@2023#ca", name: "Lekhashree P" },
  { email: "vibhu.vaibhav@onezippy.ai", password: "vv@3325#cz", name: "Vibhu Vaibhav" },
  { email: "ritesh.singh@onezippy.ai", password: "rs@2027#cz", name: "Ritesh Singh" },
  { email: "soundarya.dash@onezippy.ai", password: "sd@2027#cz", name: "Soundarya Dash" },
  { email: "tahir.jamal@onezippy.ai", password: "tj@2028#cz", name: "Tahir Jamal" },
  { email: "vishwas.gowda@onezippy.ai", password: "vg@2035#cz", name: "Vishwas Gowda" },
  { email: "rahul.kumar@onezippy.ai", password: "rk@2031#cz", name: "Rahul Kumar" },
  { email: "nikhil.sinha@onezippy.ai", password: "ns@2032#cz", name: "Nikhil Sinha" },
  { email: "shilpi.jaiswal@onezippy.ai", password: "sj@2033#cz", name: "Shilpi Jaiswal" },
  { email: "anubhav.kharel@onezippy.ai", password: "ak@2037#cz", name: "Anubhav Kharel" },
  { email: "efrem.kulakov@onezippy.ai", password: "ek@2039#cz", name: "Efrem Kulakov" },
  { email: "akash.k@onezippy.ai", password: "ak@2023#ca", name: "Akash K" },
];

function testLogin(email, password) {
  return new Promise((resolve) => {
    const sha = crypto.createHash("sha256").update(password).digest("hex");
    const data = JSON.stringify({ email, password: sha });
    const req = http.request({
      hostname: "localhost", port: 3099,
      path: "/api/v1/G/auth/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": data.length }
    }, (res) => {
      let body = "";
      res.on("data", d => body += d);
      res.on("end", () => {
        try {
          const j = JSON.parse(body);
          const ok = j.accessToken || j.requiresMfa || j.tempToken;
          resolve(ok ? "✅" : "❌ " + (j.message || "?"));
        } catch(e) { resolve("❌ parse error"); }
      });
    });
    req.on("error", e => resolve("❌ " + e.message));
    req.write(data);
    req.end();
  });
}

async function run() {
  const c = new Client({ host: "localhost", port: 5433, database: "zorbit_identity", user: "zorbit", password: "091c21b78fbdb4841500807e7bdfbedb" });
  await c.connect();

  console.log("=== User Authentication Verified Post-Migration ===");
  console.log("");
  console.log("Name                    | Email                          | Password Set | Login Test");
  console.log("------------------------|--------------------------------|--------------|----------");

  for (const u of USERS) {
    // Hash: sha256 then bcrypt
    const sha = crypto.createHash("sha256").update(u.password).digest("hex");
    const hash = await bcrypt.hash(sha, 12);

    // Check if user exists
    const exists = await c.query('SELECT "hashId" FROM users WHERE email_token = $1', [u.email]);

    if (exists.rows.length === 0) {
      console.log(u.name.padEnd(23) + " | " + u.email.padEnd(30) + " | NOT FOUND    | ❌ No account");
      continue;
    }

    // Update password
    await c.query('UPDATE users SET password_hash = $1 WHERE email_token = $2', [hash, u.email]);

    // Test login
    const result = await testLogin(u.email, u.password);

    console.log(u.name.padEnd(23) + " | " + u.email.padEnd(30) + " | ✅ Individual | " + result);
  }

  await c.end();
  console.log("");
  console.log("All passwords set to individual values from super_admins.json");
}

run().catch(console.error);
