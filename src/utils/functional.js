// Created by madara all rights reserved.

export function presentIn(inWhat) { return field => Boolean(inWhat[field]); }
export function not(fn){ return (...args) => !fn(...args); }
