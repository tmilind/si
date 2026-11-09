---
title: "Weight-space programming: when a model edits another model's weights"
date: 2026-11-08
summary: A new line of work has a general-purpose language model read a neural network's raw weights and write new ones directly, with no optimiser. The early results are striking and largely unreplicated, so here is what was actually shown and how we would treat it.
draft: false
---
Weight-space programming is the idea that a general-purpose language model can treat another neural network's weights the way a programmer treats source code. It reads the numbers, works out what each part of the network computes, and writes new numbers to change that, without gradient descent, a loss function or a training loop. The term comes from ["Sparks of Weight-Space Programming"](https://rikiyat.github.io/blog/weight-space-programming/), a post by Rikiya Takehi, Jayden Teoh, Alex Zhang and Omar Khattab of MIT CSAIL, published on 2 November 2026. The authors call the results "very early". It is a blog post, not a peer-reviewed paper, and we could not find an arXiv version.

## What the post showed

The model doing the work is called GPT-6 Astra in the post. Across eight experiments it received weights as text, sometimes with a Python sandbox or a budget of forward passes, never gradients.

**Reading.** Given the unlabelled weights of four PPO-trained policies for grid versions of Breakout, Pong, Pac-Man and Freeway, each with 17,253 weights, it named the correct game for all four without being told the options. Given only the middle transformer blocks of three small character-level language models, it named the language each was trained on (Python, romaji, English). It failed to tell a sycophantic Gemma 3 270M fine-tune from an honest one using the weights alone, and succeeded only once it was given attention patterns.

**Writing.** A car-control policy of 171,664 weights that never succeeded in 256 episodes was fixed by one edit to 3.5% of its weights, after which it succeeded in all 1,024. Starting from all-zero networks, it wrote MinAtar game policies from the games' rules: 517.4 on Breakout against 25.3 for PPO trained for 500 million steps, but 53.1 against 88.9 on Seaquest and 53.2 against 55.2 on Asterix. The headline experiment edited Qwen3.5-0.8B. Working in Python with up to 50 forward-pass batches on practice problems, it traced a looping failure to one direction written by the MLPs of layers 15 and 19, and subtracted it from 131,072 weights, 0.016% of the model. MATH-500 went from 7.9% to 48.1%, and the share of answers hitting the token limit fell from 93.0% to 33.1%. The same procedure on Gemma 3 270M gave no meaningful gain, which the authors read as editing being able to "remove an obstacle that hid an ability" but not to add one.

The authors released [the full logs](https://github.com/RikiyaT/lm_understand-logs): prompts, responses, the code the model ran, the networks it read and wrote, and the evaluations behind each number. The edited Qwen checkpoint is [on Hugging Face](https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming), and its model card reports a rebuild from the logs and a re-run on the full MATH-500 that scored 51.0%. That is the closest thing to independent confirmation so far, and it reproduces an artefact, not the method.

## How it differs from what came before

Fine-tuning changes weights by following a gradient on data. Weight-space programming has no gradient. The change is whatever the reading model decides to write, so one edit can touch 3.5% of a small network or 0.016% of a large one.

Classic model editing also changes weights without a full training run, but by a fixed algorithm. [ROME](https://arxiv.org/abs/2202.05262) uses causal interventions to locate where a fact is stored and applies a rank-one update to a mid-layer feed-forward module. Task arithmetic adds and subtracts the differences between fine-tuned and base checkpoints. These are procedures a person chooses and runs. In weight-space programming the model improvises the procedure for each network. The Qwen fix resembles a known technique, removing a direction from the weights, but the model found the direction and decided to remove it.

Weight-space learning runs the other way. It trains networks that take other networks' weights as input, for example to [predict a classifier's accuracy from its weights](https://arxiv.org/abs/2002.11448) without running it. Those models are trained for one job. Here the reader is a general-purpose LLM with no training for the task.

## Why it is getting attention now

Two things carried it beyond one lab's blog within a week. First, [Simon Willison ran the no-tools game-identification test on a laptop](https://simonwillison.net/2026/Nov/3/qwen-can-interpret-model-weights/), using the released prompts and Qwen 3.8 27B. It named Pac-Man, Pong and Breakout, failed on Freeway, and took between 46 minutes and just over an hour for each. He also points out that the post mixes two things worth separating: reading weights without tools, and editing weights with code.

Second, the first applied paper appeared. [Weight-space programming for auditing clinical decision networks](https://arxiv.org/abs/2611.05341), by Humza Nusrat and Omar Nusrat, gave a frontier model (Claude Opus 5.5) a radiotherapy planning protocol and the raw weights of small classifiers with planted flaws, with no tools. It named the broken rule in 16 of 18 flawed networks and repaired all 16, changing a median of 3 parameters. Fine-tuning also repaired every network but changed 432 or 433 of 433 parameters. The model found 1 of 3 hidden triggers and cleared only 2 of 5 healthy networks without a forced verdict. Plain testing against the protocol separated every flawed network from every healthy one in under a second. The authors conclude that the approach can locate and repair some flaws in small networks but "cannot yet certify that a network is correct".

## What we don't know yet

**Scale.** [Matthew Honnibal notes](https://honnibal.dev/blog/astra-read-write-misleading) that the raw-weights-only setting was tested only on networks of roughly 17,000 to 172,000 weights, and that every experiment on a real language model used Python and ran the network. The auditing paper's networks had 433 to 4,801 parameters, and its authors say that putting the whole network in the prompt "cannot reach clinical scale".

**Replication.** Nobody outside the original group has re-run the writing results end to end. Willison's run repeats one reading task with a different model. The Hugging Face re-run rebuilds the edited checkpoint from the logs. Neither tests whether another lab, model or network gets comparable edits.

**Whether it beats an expert with numpy.** Willison, among others, argues that an experienced researcher could reach the same answers on these tasks, and the Qwen fix resembles steering work people already do by hand. The real claim is that a general model does it unaided and cheaply, and nobody has measured that against human time or cost.

**Safety.** A model that can read a network and write targeted changes is an auditing tool and a tampering tool at once. The original post mentions auditing for backdoors and models improving their own weights, without discussing the risks. And as the auditing paper shows, finding one planted flaw is not the same as showing there are none.

## What we'd do

Treat it as a research signal to track, not a technique to adopt. The results are a week old and come mostly from one group's own measurements with one model.

Try it on something tiny. The logs repository has the prompts and networks for each experiment. Running the game-identification prompt against a model we already use, on a network small enough to fit in context and with a known answer, costs an afternoon and teaches more than any summary.

Keep gradient-based training and established editing methods for anything in production. When we change a model's behaviour, the change should come from a procedure we can rerun, with a regression evaluation around it. At best, a weight-space edit is a hypothesis about where a problem lives. If one looks useful, verify it the same way.

Watch for replication. What would change our view is an independent group reproducing the writing results on networks the authors did not choose, or a tools-free reading result on a network of more than a few hundred thousand weights. Until then, the most practical idea here is the auditing one, used to generate hypotheses about a small model that we then test the ordinary way.
