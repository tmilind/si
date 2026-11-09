---
date: 2026-11-07
draft: true
---
<!-- DRAFT for owner review: edit freely, then set draft: false -->
Tables break first when we evaluate retrieval over long documents. A table split across chunks loses its header row, and answers drawn from the second half come back fluent, confident and attached to the wrong column. We now check how tables survive ingestion before we compare embedding models or rerankers, because no amount of ranking quality restores a cell that has lost its label.
