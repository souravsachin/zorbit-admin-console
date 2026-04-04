const crypto = require("crypto");
const http = require("http");
const { Client } = require("/home/sourav/apps/zorbit-platform/zorbit-identity/node_modules/pg");

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
          resolve({ email, status: ok ? "OK" : "FAIL", detail: j.requiresMfa ? "MFA required" : (j.accessToken ? "Token issued" : j.message || "?") });
        } catch(e) { resolve({ email, status: "FAIL", detail: "parse error" }); }
      });
    });
    req.on("error", e => resolve({ email, status: "FAIL", detail: e.message }));
    req.write(data);
    req.end();
  });
}

async function run() {
  // Get all users with emails
  const c = new Client({ host: "localhost", port: 5433, database: "zorbit_identity", user: "zorbit", password: "091c21b78fbdb4841500807e7bdfbedb" });
  await c.connect();
  const all = await c.query('SELECT "hashId", email_token, display_name FROM users WHERE email_token IS NOT NULL ORDER BY display_name');
  await c.end();

  // Test key users
  const testUsers = [
    { email: "s@onezippy.ai", password: "s@2021#cz", name: "Sourav (admin)" },
    { email: "mariam.shamsi@awnic-demo.ae", password: "Zorbit@2026!", name: "Mariam" },
    { email: "rajesh.k@awnic-demo.ae", password: "Zorbit@2026!", name: "Rajesh" },
    { email: "dr.fatima@awnic-demo.ae", password: "Zorbit@2026!", name: "Dr. Fatima" },
    { email: "priya.sharma@awnic-demo.ae", password: "Zorbit@2026!", name: "Priya" },
    { email: "ahmed.qasimi@awnic-demo.ae", password: "Zorbit@2026!", name: "Ahmed" },
    { email: "james.wilson@brokers-uae.ae", password: "Zorbit@2026!", name: "James" },
  ];

  // Find Anubhav
  const anubhav = all.rows.find(r => r.display_name && r.display_name.toLowerCase().includes("anubhav"));
  if (anubhav) {
    testUsers.push({ email: anubhav.email_token, password: "Zorbit@2026!", name: "Anubhav" });
  }

  // Find other devs
  for (const name of ["Akash", "Ritesh", "Vishwas", "Lekhashree"]) {
    const u = all.rows.find(r => r.display_name && r.display_name.toLowerCase().includes(name.toLowerCase()));
    if (u) testUsers.push({ email: u.email_token, password: "Zorbit@2026!", name });
  }

  console.log("Name                 | Email                          | Status | Detail");
  console.log("---------------------|--------------------------------|--------|----------------");

  for (const u of testUsers) {
    const r = await testLogin(u.email, u.password);
    console.log(u.name.padEnd(20) + " | " + r.email.padEnd(30) + " | " + r.status.padEnd(6) + " | " + r.detail);
  }
}

run().catch(console.error);
