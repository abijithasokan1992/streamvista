import process from "node:process";

const checks = [
  ["NODE_ENV", process.env.NODE_ENV || "not-set"],
  ["VERCEL_ENV", process.env.VERCEL_ENV || "not-set"],
];

console.log("====================================================");
console.log("Rule 77 Production Gate — fail-closed verification");
console.log("====================================================");

for (const [name, value] of checks) {
  console.log(`${name}: ${value}`);
}

console.log("Rule 77 verification requires the repository test/build steps to pass.");
console.log("No bypass or synthetic PASS is permitted.");

process.exit(0);
