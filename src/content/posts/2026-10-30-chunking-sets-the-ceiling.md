---
title: Chunking sets the ceiling on retrieval
date: 2026-10-30
summary: Before embeddings, rerankers or prompts, the way you split documents decides what retrieval can find. Here is how to get it right first.
draft: true
---
<!-- DRAFT for owner review. Edit freely, then set draft: false and delete this line. -->
Most retrieval-augmented systems are tuned in the wrong order. Teams compare embedding models, add a reranker, rewrite the prompt, and only then look at how the documents were split. By that point the ceiling is already set. A retriever can only return chunks that exist, and if the answer to a question was cut in half on ingestion, no amount of ranking quality will put it back together.

## What a chunk has to carry

A chunk is both the unit of retrieval and the unit of evidence. It has to be small enough that its embedding means one thing, and large enough that the model reading it can use it without the rest of the document. Those two pressures pull in opposite directions, and fixed-size splitting resolves the tension by ignoring it.

Splitting every few hundred tokens with some overlap is a reasonable default for prose that flows evenly. Most real documents do not. Contracts have clauses that depend on definitions forty pages earlier. Reports put the conclusion in a table and the caveat in a footnote. Manuals nest steps under headings that carry half the meaning. A fixed window cuts through all of these without noticing.

## Three failures to look for

**Lost context.** A chunk that says "the fee is waived in this case" is useless without knowing which fee and which case. Its embedding is vague, and even when it is retrieved, the model has to guess.

**Split structure.** Tables, lists and code blocks lose their meaning when divided. The second half of a table without its header row is a grid of values with no labels, and a model will still happily read answers off it.

**Diluted chunks.** Chunks that are too large blend several topics, so their embeddings sit somewhere between all of them and match none strongly. Recall looks fine in aggregate and falls apart on specific questions.

## Split on structure, then carry the context down

The approach that tends to hold up is to split along the document's own structure first, and fall back to size limits only within a section. Headings, clauses, list items and table boundaries are the author telling you where the ideas break. Then prefix each chunk with its path of headings, so a paragraph deep in a manual still knows it belongs to "Installation > Network > Proxy settings".

```python
def chunk_section(path, blocks, max_tokens=400):
    """Group a section's blocks into chunks without splitting any block,
    and prefix each chunk with its heading path."""
    header = " > ".join(path)
    chunks, current, size = [], [], 0
    for block in blocks:
        n = count_tokens(block.text)
        if current and size + n > max_tokens:
            chunks.append(header + "\n\n" + "\n\n".join(b.text for b in current))
            current, size = [], 0
        current.append(block)
        size += n
    if current:
        chunks.append(header + "\n\n" + "\n\n".join(b.text for b in current))
    return chunks
```

Here `blocks` are the paragraphs, list items, tables and code samples of one section, as your parser produces them, and `count_tokens` is whatever tokeniser matches your embedding model. Two details matter. Blocks are never split, so a table stays whole even if it pushes a chunk over the limit; an oversized chunk is a smaller problem than a headless table. And the heading path is part of the text that gets embedded, not just metadata alongside it, so it shapes what the chunk matches.

When a table really is too large to keep whole, split it by rows and repeat the header row in every piece. It is a few lines of code and it removes a whole class of quietly wrong answers.

## Measure retrieval on its own

None of this is worth much unless you can see its effect, and end-to-end answer quality is a noisy place to look. Build a small set of questions where you know which passage holds the answer, and check whether that passage appears in the top results. Run it every time you change the splitter. It is the cheapest evaluation you will ever write, and it separates retrieval failures from generation failures, which otherwise look identical from the outside.

When the right passage is retrieved and the answer is still wrong, look at the model and the prompt. When it is not retrieved, look at the chunks before anything else. Read a few dozen of them exactly as the retriever sees them, with no surrounding document. If you cannot tell what a chunk is about, neither can the embedding.

## The order of work

Get the chunks right, measure retrieval directly, and only then tune embeddings and rerankers. Those later steps help, but they work on the material chunking gives them. A better embedding model finds the closest chunk more reliably; it cannot make that chunk contain the answer.
