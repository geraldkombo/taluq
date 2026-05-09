/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { tokenizeChatText } from "./render";

test("tokenizeChatText extracts receipt paths and pay links", () => {
  const tokens = tokenizeChatText("Open /receipt/tx1 and https://github.com/geraldkombo/254712345678 now.");
  assert.deepEqual(tokens, [
    { kind: "text", value: "Open " },
    { kind: "link", value: "/receipt/tx1" },
    { kind: "text", value: " and " },
    { kind: "link", value: "https://github.com/geraldkombo/254712345678" },
    { kind: "text", value: " now." },
  ]);
});

