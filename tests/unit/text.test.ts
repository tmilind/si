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
});
