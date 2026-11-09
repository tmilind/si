---
title: What a tool call costs
date: 2026-10-29
summary: A look at the real price of one agent tool call, from tokens to retries.
draft: false
---
Every tool call an agent makes has a cost that is easy to underestimate. The obvious part is tokens: the request, the schema, the result. The less obvious part is everything that happens when the call fails.

Here is the shape of a typical wrapper.

```ts
async function call(tool: string, args: unknown) {
  for (let i = 0; i < 3; i++) {
    try { return await run(tool, args); } catch { await sleep(2 ** i * 100); }
  }
  throw new Error('tool failed');
}
```

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

Retries multiply the token bill because the model must re-read the context, reason about the failure, and decide whether to try again or give up. Teams often measure average latency and ignore the long tail, which is where most of the spend hides. A careful budget tracks the number of calls per task, the share that fail, and the tokens spent recovering from those failures, and it treats those numbers as a product metric rather than an infrastructure detail.

