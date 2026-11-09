---
title: "Weight-space programming: a model that edits another model's weights"
date: 2026-11-08
summary: A general-purpose language model reads a network's raw weights and writes new ones, with no gradient. Early, striking, mostly unreplicated results on small networks; what was shown and how we would treat it.
draft: false
---
Weight-space programming treats a neural network's weights as source code. A general-purpose language model reads the numbers, works out what each part computes, and writes new numbers to change it, with no loss function, gradient or training loop. The term comes from ["Sparks of Weight-Space Programming"](https://rikiyat.github.io/blog/weight-space-programming/), a blog post from MIT CSAIL published on 2 November 2026. It is not a peer-reviewed paper, and the authors call the results "very early".

## What the post showed

The model, GPT-6 Astra, received weights as text across eight experiments, sometimes with Python or a forward-pass budget, never with gradients.

**Reading.** From the unlabelled weights of four PPO policies for grid versions of Breakout, Pong, Pac-Man and Freeway (17,253 weights each), it named all four games unprompted. From only the middle blocks of three small character-level language models, it named each training language. It could not tell a sycophantic Gemma 3 270M fine-tune from an honest one until given attention patterns.

**Writing.** A car-control policy of 171,664 weights that failed all 256 evaluation episodes succeeded in 1,024 of 1,024 after one edit to 3.5% of its weights. Starting from all-zero networks and the game rules, it wrote MinAtar policies that beat PPO trained for 500 million steps on Breakout by a factor of about 20, and lost on Seaquest and Asterix.

The headline result is on Qwen3.5-0.8B. With a Python kernel and up to 50 forward-pass batches, the model traced the network's looping to one direction written by the MLPs of layers 15 and 19, and subtracted it from 131,072 weights (0.016% of the model). MATH-500 rose from 7.9% to 48.1%; answers hitting the token limit fell from 93.0% to 33.1%. On Gemma 3 270M it found no single failing component and gained nothing meaningful. The authors' reading: editing "could remove an obstacle that hid an ability, but it could not add an ability the model lacked."

The [logs repository](https://github.com/RikiyaT/lm_understand-logs) holds the prompts, responses, executed code, networks and evaluations. The [edited Qwen checkpoint](https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming) was rebuilt from that diff by a third party, hash-verified against the original, and re-run on the full MATH-500 at 51.0%. That confirms the artefact, not the method.

## How it differs from existing techniques

**Fine-tuning** follows a gradient on data. Here there is no gradient; the change is whatever the reading model decides to write. **Model editing** such as [ROME](https://arxiv.org/abs/2202.05262) also skips full training, but runs a fixed algorithm: locate a fact by causal intervention, apply a rank-one update to a mid-layer feed-forward module. In weight-space programming the model improvises the procedure for each network. The Qwen fix resembles known direction removal, but the model found the direction itself. **Weight-space learning** trains a dedicated network on weights as input, for example to [predict a classifier's accuracy from its weights](https://arxiv.org/abs/2002.11448). Here the reader is a general model with no training for the task.

## Outside evidence so far

[Simon Willison ran the no-tools game-identification prompt on a laptop](https://simonwillison.net/2026/Nov/3/qwen-can-interpret-model-weights/) with Qwen 3.8 27B. It named Breakout, Pong and Pac-Man, missed Freeway, and took 46 to 65 minutes per game. He argues that reading weights without tools and editing them with code should be treated separately.

The first applied paper, [on auditing clinical decision networks](https://arxiv.org/abs/2611.05341), gave Claude Opus 5.5 a radiotherapy planning protocol and the raw weights of small classifiers (433 to 4,801 parameters) with planted flaws, all tools disabled. It named the broken rule in 16 of 18 flawed networks and repaired all 16, changing a median of 3 parameters. Fine-tuning also repaired every network but changed 432 or 433 of 433 parameters. The model found 1 of 3 hidden triggers and cleared only 2 of 5 healthy networks unforced, while plain testing against the protocol separated every flawed network from the healthy ones in under a second. The authors conclude it "cannot yet certify that a network is correct".

## What we don't know

**Scale.** As [Matthew Honnibal points out](https://honnibal.dev/blog/astra-read-write-misleading), the raw-weights-only setting was tested only on networks of 17K–172K weights, and every experiment on a real language model used Python. The auditing paper says putting the whole network in the prompt "cannot reach clinical scale".

**Replication.** No outside group has re-run the writing results; Willison repeated one reading task and the Hugging Face re-run rebuilt one checkpoint.

**Value over a human.** Willison notes an experienced person could reach the same answers with enough effort. Nobody has measured the model's time or cost against a human's.

**Safety.** A model that can read a network and write targeted changes is an auditing tool and a tampering tool at once. And as the auditing paper shows, finding a planted flaw is not showing there are none.

## What we'd do

**Track, don't adopt.** The results are a week old, mostly one group's measurements with one model.

**Try it small.** Run the released game-identification prompt against a model we already use. It costs an afternoon.

**Keep production changes reproducible.** Use gradient-based training or established editing methods, with a regression evaluation around them. Treat a weight-space edit as a hypothesis about where a problem lives, and verify it the same way.

**Watch for** an independent group reproducing the writing results on networks the authors did not choose, or a tools-free reading result on a network above a few hundred thousand weights. Until then, the practical use is auditing: generating hypotheses about a small model that we test the ordinary way.
