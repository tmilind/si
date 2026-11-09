process.env.TZ = 'America/Los_Angeles';
import { describe, it, expect } from 'vitest';
import {
  formatDate, stripMarkdown, firstSentence, truncateWords,
  headlineSplit, readingTime, noteTitle,
} from '../../src/lib/text';

describe('text helpers', () => {
  it('formatDate uses UTC fields', () => {
    expect(formatDate(new Date('2026-11-07'))).toBe('07 Nov 2026');
  });
  it('stripMarkdown flattens links and code', () => {
    expect(stripMarkdown('See [the talk](https://x.y) and `temperature=0`.')).toBe('See the talk and temperature=0.');
  });
  it('firstSentence stops at first boundary', () => {
    expect(firstSentence('One. Two? Three')).toBe('One.');
    expect(firstSentence('No boundary')).toBe('No boundary');
  });
  it('truncateWords cuts with ellipsis', () => {
    expect(truncateWords('a '.repeat(50).trim(), 20)).toMatch(/…$/);
    expect(truncateWords('short text', 20)).toBe('short text');
  });
  it('headlineSplit leaves short notes whole and splits long ones', () => {
    expect(headlineSplit('Short note.')).toEqual({ lead: 'Short note.', rest: '' });
    const long = 'First sentence here. ' + 'x'.repeat(250);
    expect(headlineSplit(long).lead).toBe('First sentence here.');
    expect(headlineSplit(long).rest.startsWith('x')).toBe(true);
  });
  it('readingTime rounds up with minimum 1', () => {
    expect(readingTime('word '.repeat(2200))).toBe(10);
    expect(readingTime('hi')).toBe(1);
  });
  it('noteTitle is a truncated plain first sentence', () => {
    expect(noteTitle('[Agents](u) are mostly loops. More text.')).toBe('Agents are mostly loops.');
  });

  it('formatDate is stable under a non-UTC timezone', () => {
    const d = new Date('2026-11-07');
    expect(d.getDate()).toBe(6); // local getters would shift the day
    expect(formatDate(d)).toBe('07 Nov 2026');
  });
  it('stripMarkdown leaves code span contents verbatim', () => {
    expect(stripMarkdown('`__init__`')).toBe('__init__');
    expect(stripMarkdown('Use `**kwargs` here')).toBe('Use **kwargs here');
    expect(stripMarkdown('the `_id` field')).toBe('the _id field');
    expect(stripMarkdown('`2*3*4` is 24')).toBe('2*3*4 is 24');
  });
  it('stripMarkdown handles images and nested emphasis', () => {
    expect(stripMarkdown('![alt text](a.png) after')).toBe('alt text after');
    expect(stripMarkdown('**bold _and italic_ text**')).toBe('bold and italic text');
  });
  it('headlineSplit lead is plain text when first sentence has code and link', () => {
    const long = 'Use `foo()` with [the docs](https://x.y) **now**. ' + 'x'.repeat(250);
    const { lead, rest } = headlineSplit(long);
    expect(lead).toBe('Use foo() with the docs now.');
    expect(lead).not.toMatch(/[\[`*]/);
    expect(rest.startsWith('x')).toBe(true);
  });
  it('noteTitle keeps inline code contents', () => {
    expect(noteTitle('Set `__debug__` first. Then go.')).toBe('Set __debug__ first.');
  });
  it('firstSentence ignores dots not followed by whitespace', () => {
    expect(firstSentence('v2.0 is out. Next.')).toBe('v2.0 is out.');
  });
  it('truncateWords handles a first word longer than max', () => {
    expect(truncateWords('supercalifragilistic word', 5)).toBe('super…');
  });
});
