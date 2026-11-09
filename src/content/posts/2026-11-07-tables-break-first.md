---
title: Tables break first in long-document retrieval
date: 2026-11-07
summary: In retrieval over long documents, answers that live in tables tend to go wrong first, and they go wrong plausibly. Why naive chunking breaks tables, how to measure it, and what to change before you touch the embedding model.
draft: false
---
Prose tolerates bad chunking better than tables do. A paragraph cut in half usually keeps enough meaning in each half to be retrieved and read. A table cut in half becomes a grid of numbers with no labels, and a model reading it will still answer, fluently and from the wrong column. So check how tables survive ingestion before comparing embedding models or rerankers: no ranking quality restores a cell that has lost its label.

This is the table-specific follow-up to [Chunking sets the ceiling on retrieval](/posts/chunking-sets-the-ceiling/).

## Why tables fail

A table's meaning lives in the binding between each cell and two labels: its row and its column. Flattening it to text and splitting by size breaks that binding in predictable ways.

**The header is separated from the body.** A table that spans several chunks keeps its header in the first one only. Every later chunk is rows of values whose column names are elsewhere, and they still look like data.

**Columns are lost even inside one chunk.** PDF and HTML extractors often emit tables as whitespace-separated tokens. Once the grid is gone, "Q3 4.2 3.9 5.1" can only be read by counting columns, which neither embeddings nor language models do reliably.

**Units live in the header.** "Revenue (£m)", "Latency (ms, p95)", "Dose (mg/kg)": the unit is stated once, at the top. Lose the header and the model reports 4.2 in whatever unit it guesses.

**Merged cells lose their scope.** Multi-level headers and row groups are common in reports and filings. Extractors either repeat a merged value into every cell it covers or put it in the first and leave the rest blank, which drops the group label from every row but one.

## How it shows up

Not as "I don't know", but as a specific, plausible, wrong answer. Ask for the 2024 figure and get 2023's, because the retrieved chunk has the right row and the model picked a column by position. Ask for a value reported in thousands and get it as units. Ask about a row near the bottom of a long table and get its neighbour's value, because a chunk boundary fell between the row label and its values.

End-to-end review rarely catches this. The answer cites a real document, the number really appears in it, and the sentence reads well. Seeing the error means tracing the cell back to its labels, which nobody does at scale, so measure it deliberately.

## A small table evaluation

Take a few representative documents with tables, including at least one long enough to span several chunks. Write questions whose answer is a single cell, and record the expected value with its row label, column label and unit. Include rows near the end of long tables, cells under multi-level headers, and values whose unit appears only in the header.

Score two things separately:

| Stage | Pass when |
| --- | --- |
| Retrieval | A top-*k* chunk contains the answer cell **and** the labels needed to read it |
| Answer | The returned value and unit are correct |

A retrieval pass with an answer failure points at the model; a retrieval failure points at chunking. Keep this as a dedicated set: a general question set with a few table questions will bury these failures in the average. Rerun it whenever ingestion changes, including the extractor; a new PDF parser can improve prose and quietly wreck tables.

## Remedies

**Keep small tables whole.** Treat a table as one block and let a chunk exceed the usual size to keep it intact, up to a hard ceiling below the embedding model's input limit.

**Above that, split by rows and repeat the header.** Never split mid-row, and prefix every piece with the caption and header row:

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

`count_tokens` is your embedding model's tokeniser. Flatten multi-level headers before calling it, so each column name carries its group and unit, such as "2024 / Revenue (£m)".

**Or serialise rows as key: value text.** Write each row as "Region: North; Year: 2024; Revenue (£m): 4.2". It costs more tokens, but every value sits next to its label, so the binding survives any split and nothing has to count columns. For narrow tables, where the overhead is small, this is often the better default.

**Route dataset-sized tables to a structured store.** Thousands of rows that people filter, sum and compare are not a text-retrieval problem. Load them into a database or dataframe, index a short description of each table, and query the table once its description is retrieved. The retriever's job becomes finding the right table, not the right cell.

Then rerun the table set. Until tables come through intact, comparing embedding models and rerankers measures how well they rank chunks that cannot contain a correct answer.
