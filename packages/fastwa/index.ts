// Loaded by the framework, so apps don't need to import it themselves
import 'reflect-metadata';

export * from './common';
export * from './core';

// Both export a `Module`: the public one is the decorator, the core one is
// the internal module reference
export { Module } from './common';
