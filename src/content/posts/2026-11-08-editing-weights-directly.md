---
title: Editing model weights directly is becoming a normal tool
date: 2026-11-08
summary: Changing what a model knows or does by editing its weights, rather than retraining or prompting it, has moved from research curiosity to something teams with open-weight models can use. It works for some jobs and fails quietly for others, so treat every edit like a code change.
draft: false
---
For most teams, there have been two ways to change a model's behaviour: prompt it differently or fine-tune it. A third option has matured alongside them. You can change the weights directly, by targeted surgery on a few layers, by adding and subtracting the differences between fine-tuned checkpoints, or by merging several specialists into one model. None of these needs a training run in the usual sense, some run on a CPU, and the tooling is now mature enough for any team building on open-weight models. So it is worth being clear about what each method does, where it holds up, and where it fails without telling you.

## Three families of weight editing

**Locate and edit.** [ROME](https://arxiv.org/abs/2202.05262) started from an interpretability question: locating where a GPT-style model stores a fact such as "the Eiffel Tower is in Paris". The authors traced factual recall to the feed-forward modules in the middle layers and showed that a rank-one update to one of those modules could replace a single association. [MEMIT](https://arxiv.org/abs/2210.07229) extended the idea to spread updates across several layers and write thousands of edits at once, demonstrated on GPT-J and GPT-NeoX. These methods change facts: one subject, one relation, one new object.

**Task arithmetic.** [Editing Models with Task Arithmetic](https://arxiv.org/abs/2212.04089) defined a task vector as the difference between a fine-tuned model's weights and the base model's weights. Adding the vector to the base gives you the behaviour; adding several gives you several behaviours; negating one weakens that behaviour while, in the paper's experiments, leaving control tasks largely intact. That last property is the interesting one for practitioners, because it offers a way to remove a behaviour you trained in, not just add one.

**Merging.** If task vectors can be added, several fine-tunes of the same base can be combined into one model. The simplest version is plain weight averaging of models that share a starting point. [TIES-Merging](https://arxiv.org/abs/2306.01708) refines it by trimming small changes, resolving sign conflicts between models, and merging only the parameters that agree. [DARE](https://arxiv.org/abs/2311.03099) randomly drops most of each model's delta parameters and rescales the rest before merging, and its authors report that a large majority of fine-tuning deltas can be dropped with little loss. [mergekit](https://github.com/arcee-ai/mergekit) implements these and more, including task arithmetic, TIES and DARE variants, and runs merges entirely on CPU.

An adjacent approach leaves the weights alone and edits activations instead: compute a direction in a layer's hidden states that corresponds to a behaviour, and add or subtract it at inference time. Activation steering is easier to switch on and off than a weight edit, which makes it a good tool for exploring a behaviour before committing to a permanent change.

## A task vector in a few lines

The core operation in task arithmetic is plain tensor arithmetic over state dicts. Given a base model and a fine-tuned model with the same architecture:

```python
import torch

base = torch.load("base.pt")       # state_dict of the base model
tuned = torch.load("tuned.pt")     # same architecture, fine-tuned on a task

task_vector = {k: tuned[k] - base[k] for k in base}

def apply(base, vectors, alphas):
    """theta = theta_base + sum(alpha_i * tau_i)"""
    return {k: base[k] + sum(a * v[k] for v, a in zip(vectors, alphas))
            for k in base}

stronger = apply(base, [task_vector], [1.5])   # amplify the behaviour
removed  = apply(base, [task_vector], [-1.0])  # subtract it from the base
```

Real checkpoints need care with dtypes, tied embeddings and keys present in only one model; merging libraries handle most of that. The idea really is this small, and the scaling coefficient is the main knob: it usually needs tuning against a held-out set rather than being left at 1.

## What works and what does not

**Edits that hit the exact phrasing but not the consequences.** Changing "X was born in A" to "X was born in B" is one fact. A model that has really absorbed the change should also update the country X was born in, the language X likely grew up speaking, and so on. [Evaluating the Ripple Effects of Knowledge Editing](https://arxiv.org/abs/2307.12976) built a benchmark of exactly these implied facts and found that editing methods usually get the edited fact right and the related facts wrong. In that benchmark a simple in-context editing baseline did best. If the goal is "the model should know this", putting it in the context is often still the more reliable route.

**Collateral damage and sequential degradation.** A single locate-and-edit change can look clean; a long series of them does not. [Model Editing at Scale leads to Gradual and Catastrophic Forgetting](https://arxiv.org/abs/2401.07453) applied edits one after another with ROME and MEMIT and found two phases: a gradual loss of earlier edits and of downstream task ability, then an abrupt collapse. The same work reports that these edits are less localised than previously believed. The lesson is that edits accumulate, and the cost of the hundredth edit is not the cost of the first.

**Merging works best between close relatives.** Averaging and merging rely on the models sharing a base. Merging fine-tunes of the same checkpoint is the well-trodden path; merging models whose weights have drifted far apart is where it gets hard. The DARE authors note this limit themselves: after continued pre-training the deltas grow too large for their method to work.

**Evaluation is the hard part.** An edit's success metric is easy to write and misleading on its own. Whether the edited fact comes back for the training phrasing tells you almost nothing about paraphrases, related facts, or what else moved. The changes that matter are the ones you did not test for.

## Where it fits for a company using open-weight models

**Cheap behavioural patches.** A small task vector subtracted from a model, or a narrow fine-tune merged back in at a low coefficient, is worth trying for tone, format or a specific refusal pattern before a full training cycle. It is a reasonable first move when the change is narrow and the alternative is a long prompt that every request pays for.

**Merging specialists.** If you already maintain several fine-tunes of one base, for instance one for extraction and one for a domain's terminology, merging them is worth trying before serving several models or training a combined one. Treat the result as a new model and evaluate it as one.

**Removing or adding knowledge.** This is the most tempting use and the least reliable. Locate-and-edit methods can change specific associations, but given the ripple-effect and forgetting results, we would not rely on weight editing alone to keep a model current on facts that change, or to guarantee something has been removed. Retrieval remains the better home for facts that change; editing is better suited to fixing a small number of stable, high-impact errors.

## What we'd do

Treat a weight edit exactly like a code change to a production system.

Keep the base model untouched and store each edit as a delta, a task vector or a merge recipe, under version control with a note of what it is meant to change. Any deployed model should be reproducible as base plus a list of named, versioned deltas, so that one can be reverted without redoing the others.

Before applying an edit, run a regression evaluation on the base: the task suite you care about, a sample of general capability checks, and a set of questions near the edit, including paraphrases and implied facts. Run the same evaluation after the edit and compare. Promote the edit only if the targeted change shows up across paraphrases and nothing else moved beyond the noise you see between repeated runs.

Prefer few, consolidated edits over a long sequence of small ones, and re-derive from the base when the list grows rather than stacking edits on edits. When a change is really about facts, put it in retrieval or the prompt first, and reach for the weights only when that has been measured and found wanting.
