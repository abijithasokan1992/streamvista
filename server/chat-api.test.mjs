import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeMessages } from "../api/chat.mjs";

test("sanitizeMessages rejects missing or empty conversations", () => {
  assert.equal(sanitizeMessages(undefined), null);
  assert.equal(sanitizeMessages([]), null);
  assert.equal(sanitizeMessages([{ role: "system", content: "hidden" }]), null);
});

test("sanitizeMessages keeps only supported roles and trims content", () => {
  assert.deepEqual(
    sanitizeMessages([
      { role: "system", content: "ignore" },
      { role: "user", content: "  hello  " },
      { role: "assistant", content: "  hi there " },
    ]),
    [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ],
  );
});

test("sanitizeMessages limits individual message size", () => {
  const result = sanitizeMessages([{ role: "user", content: "x".repeat(5000) }]);
  assert.equal(result?.[0]?.content.length, 4000);
});

test("sanitizeMessages limits history to the most recent 20 messages", () => {
  const input = Array.from({ length: 25 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `message-${index}`,
  }));
  const result = sanitizeMessages(input);
  assert.equal(result?.length, 20);
  assert.equal(result?.[0]?.content, "message-5");
  assert.equal(result?.at(-1)?.content, "message-24");
});
