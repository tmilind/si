---
title: Chunking sets the ceiling on retrieval
date: 2026-10-30
summary: The way you split documents decides what retrieval can find, before embeddings, rerankers or prompts. Split on structure, carry the heading path into each chunk, and measure retrieval on its own.
draft: false
---
Most retrieval-augmented systems are tuned in the wrong order: embedding models, then a reranker, then the prompt, and only then the splitter. But a retriever can only return chunks that exist. If ingestion cut the answer in half, no ranking quality puts it back together.

## What a chunk has to carry

A chunk is usually both the unit of retrieval and the unit of evidence. It has to be small enough that its embedding means one thing, and large enough that the model can use it without the rest of the document. Fixed-size splitting resolves that tension by ignoring it.

Splitting every few hundred tokens with overlap is a reasonable default for evenly flowing prose. Most real documents are not that. Contracts have clauses that depend on definitions many pages earlier. Reports put the figure in a table and the caveat in a footnote. Manuals nest steps under headings that carry half the meaning. A fixed window cuts through all of these.

## Three failures to look for

**Lost context.** "The fee is waived in this case" is useless without knowing which fee and which case. Its embedding is vague, and when it is retrieved the model has to guess.

**Split structure.** Tables, lists and code blocks lose their meaning when divided. The second half of a table without its header row is a grid of unlabelled values, and a model will still read answers off it.

**Diluted chunks.** A chunk that spans several topics gets an embedding that sits between them and matches none strongly. Broad questions still find it; specific ones miss.

## Split on structure, then carry the context down

Split along the document's own structure first (headings, clauses, list items, table boundaries) and fall back to size limits only within a section. Then prefix each chunk with its heading path, so a paragraph deep in a manual still says it belongs to "Installation > Network > Proxy settings".

```python
def chunk_section(path, blocks, max_tokens=400):
    """Group a section's blocks into chunks without splitting any block,
    and prefix each chunk with its heading path."""
    header = " > ".join(path)
    budget = max_tokens - count_tokens(header)
    chunks, current, size = [], [], 0
    for block in blocks:
        n = count_tokens(block.text)
        if current and size + n > budget:
            chunks.append(header + "\n\n" + "\n\n".join(b.text for b in current))
            current, size = [], 0
        current.append(block)
        size += n
    if current:
        chunks.append(header + "\n\n" + "\n\n".join(b.text for b in current))
    return chunks
```

`blocks` are the paragraphs, list items, tables and code samples of one section as your parser emits them; `count_tokens` is the tokeniser of your embedding model. Two details matter. Blocks are never split, so a table stays whole even if it pushes a chunk over the limit: an oversized chunk is a smaller problem than a headless table, provided it stays under the embedding model's input limit, beyond which the tail is truncated without warning. And the heading path is part of the embedded text, not metadata beside it, so it shapes what the chunk matches.

When a table is too large to keep whole, split it by rows and repeat the header row in every piece. [Tables break first in long-document retrieval](/posts/tables-break-first/) covers this in detail.

## Measure retrieval on its own

End-to-end answer quality is a noisy signal. Build a small set of questions where you know which passage holds the answer, and check whether that passage appears in the top *k* results. Record the expected passage as source text or a character span, not a chunk ID, because chunk IDs change every time you change the splitter, which is exactly when you need to rerun the set.

This separates retrieval failures from generation failures, which otherwise look identical. If the right passage is retrieved and the answer is still wrong, look at the model and the prompt. If it is not retrieved, look at the chunks first: read a few dozen exactly as the retriever sees them, with no surrounding document. If you cannot tell what a chunk is about, neither can the embedding.

Only then tune embeddings and rerankers. A better embedding model finds the closest chunk more reliably; it cannot make that chunk contain the answer.
