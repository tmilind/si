---
title: Tables break first in long-document retrieval
date: 2026-11-07
summary: When we evaluate retrieval over long documents, the first answers to go wrong are the ones that live in tables. Here is why naive chunking breaks them, how to catch it, and what to change before you touch the embedding model.
draft: true
---
<!-- DRAFT for owner review. Edit freely, then set draft: false and delete this line. -->
Tables break first when we evaluate retrieval over long documents. Prose degrades gracefully under bad chunking: a paragraph cut in half still carries most of its meaning in each half. A table cut in half does not. The second half is a grid of numbers with no labels, and a model reading it will still produce an answer, fluent and confident and attached to the wrong column. That is why we now check how tables survive ingestion before we compare embedding models or rerankers. No amount of ranking quality restores a cell that has lost its label.

We wrote about splitting documents along their own structure in [Chunking sets the ceiling on retrieval](/posts/chunking-sets-the-ceiling/). This post is the table-specific version: what goes wrong, how it shows up, how to measure it, and what to do about it.

## Why tables fail under naive chunking

A table is a two-dimensional object flattened into one dimension. Its meaning lives in the binding between each cell and two labels: the row it sits in and the column it sits under. Fixed-size chunking knows nothing about that binding, so it breaks it in predictable ways.

**The header row is separated from the body.** A table that spans more than one chunk keeps its header in the first chunk only. Every later chunk is rows of values whose column names are somewhere else. This is the most common failure and the most damaging, because the orphaned rows still look like data.

**Cell-to-label binding is lost even inside one chunk.** PDF and HTML extractors often emit tables as runs of whitespace-separated tokens. Once the grid lines are gone, "Q3 4.2 3.9 5.1" is ambiguous unless the reader can count columns reliably, and neither embeddings nor language models count columns reliably.

**Units live in the header.** "Revenue (£m)", "Latency (ms, p95)", "Dose (mg/kg)": the unit is stated once, at the top. A chunk that loses the header loses the unit, and an answer of "4.2" is wrong in a way no downstream check will notice.

**Merged and spanning cells.** Multi-level headers, row groups and cells that span several columns are common in reports and filings. Most extractors either repeat the merged value into every cell it covers or put it in the first and leave the rest blank. The second behaviour quietly drops the group label from every row but one.

## How it shows up in answers

The symptom is not "I don't know". It is a specific, plausible, wrong answer. Ask for the 2024 figure and get the 2023 one, because the chunk that was retrieved holds the right row and the model picked a column by position. Ask for a value in thousands and get it reported as if it were in units. Ask about a row near the bottom of a long table and get the value from a neighbouring row, because the chunk boundary fell between the row label and its values.

These failures are hard to spot in end-to-end review. The answer cites a real document, the number really appears in that document, and the sentence around it reads well. A reviewer has to open the source and trace the cell back to its labels to see the problem, which nobody does at scale. That is the reason to measure it deliberately rather than wait for someone to notice.

## Detecting it with a small evaluation

The evaluation we use is cheap. Pick a handful of representative documents that contain tables, including at least one table long enough to span several chunks. Write questions whose answers live in a single cell, and record the expected value along with its row and column labels. Include questions that target rows near the end of long tables, cells under a multi-level header, and values whose unit is stated only in the header.

Then measure two things separately. First, retrieval: whether the chunk containing the answer cell appears in the top results, and whether that chunk also carries the labels needed to interpret it. Second, the answer: whether the returned value is correct, with the right unit. Keeping these apart tells you whether a failure came from chunking or from the model reading a correctly retrieved chunk badly.

Run it before you change anything, and again after each change to the ingestion pipeline. In our evaluations the first failures were tables, and a general question set with only a few table questions in it will tend to bury them in the average. A dedicated set is also a useful sanity check on extractors: a new PDF parser can improve prose and silently wreck tables.

## Remedies

**Repeat the header in every table chunk.** If a table has to be split, split it by rows, never mid-row, and prefix each piece with the header row and the table's caption. This is the single highest-value change and it is a few lines of code:

```python
def chunk_table(caption, header, rows, max_tokens=400):
    """Split a table by rows, repeating caption and header in every chunk."""
    head = caption + "\n" + " | ".join(header)
    budget = max_tokens - count_tokens(head)
    chunks, current, size = [], [], 0
    for row in rows:
        line = " | ".join(row)
        n = count_tokens(line)
        if current and size + n > budget:
            chunks.append(head + "\n" + "\n".join(current))
            current, size = [], 0
        current.append(line)
        size += n
    if current:
        chunks.append(head + "\n" + "\n".join(current))
    return chunks
```

Here `count_tokens` is the tokeniser that matches your embedding model, and `header` should already have multi-level headers flattened into single labels such as "2024 / Revenue (£m)", so every column name carries its group and unit.

**Serialise rows as key: value text.** Instead of a pipe-delimited row, write each row as "Region: North; Year: 2024; Revenue (£m): 4.2". It costs more tokens, but every value now sits next to its label, so the binding survives any later split, and both the embedding and the model can read it without counting columns. For narrow tables this is often the better default.

**Keep tables whole up to a token budget.** Most tables are small. Treat a table as an indivisible block and allow a chunk to exceed the usual size limit to keep it intact, up to a hard ceiling. Split by rows, with the header repeated, only above that ceiling.

**Route large tables to a structured store.** Some tables are really datasets: thousands of rows of figures that people will filter, sum and compare. Retrieval over text chunks is the wrong tool for those. Load them into a database or dataframe, index a short description of each table for retrieval, and let the system query the table directly once the description is retrieved. The text retriever's job becomes finding the right table, not the right cell.

## What we'd do

Before tuning anything else in a retrieval system over long documents, build the table question set, run it, and read twenty of your table chunks exactly as the retriever sees them. If any chunk is a grid of values with no header, fix ingestion first: keep small tables whole, repeat the caption and header when splitting large ones, flatten multi-level headers so units and groups travel with every column, and move the dataset-sized tables into a store that can be queried. Then rerun the set. Only once tables come through intact is it worth comparing embedding models and rerankers, because until then you are measuring how well they rank chunks that cannot contain a correct answer.
