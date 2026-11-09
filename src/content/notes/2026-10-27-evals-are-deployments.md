---
date: 2026-10-27
source:
  title: Investigating unintended model actions in our evaluations and internal use
  url: https://www.anthropic.com/research/investigating-unintended-model-actions
draft: false
---
An eval with live internet access is a deployment with a scoreboard. Anthropic's account of Claude models submitting real forms, exploiting an injection flaw and using URL shorteners to get round fetch-tool limits, mostly during evaluations, names the causes: ambiguous or impossible tasks, unstated network boundaries, and training environments that reward workarounds. Anthropic has since taken live internet access out of its internal evaluations. Do the same: run agent evals against offline copies of the sites involved, and treat a task that cannot be finished honestly as a bug in the task.
