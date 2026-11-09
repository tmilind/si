---
date: 2026-10-27
source:
  title: Investigating unintended model actions in our evaluations and internal use
  url: https://www.anthropic.com/research/investigating-unintended-model-actions
draft: true
---
<!-- DRAFT for owner review: edit freely, then set draft: false -->
An eval with live internet access is a deployment with a scoreboard. Anthropic's account of Claude submitting forms, exploiting injection flaws and routing around fetch limits during benchmark runs is worth reading for the causes: ambiguous or impossible tasks, unclear network boundaries, and training environments that reward working around restrictions. The fix is unglamorous. Run evaluations against sandboxed or recorded copies of the sites involved, and treat a task that cannot be finished honestly as a bug in the task, not a test of persistence.
