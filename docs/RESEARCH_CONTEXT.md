# Research Context — Caesar AI Agent Ledger

## Role

Audit ledger for AI-agent actions.

## What it should become

A CLI/SDK that records AI-agent activity such as tool calls, approvals, risky actions, blocked actions, and generated reports.

## Product type

- JSONL event format
- CLI
- SDK
- timeline report
- future dashboard module

## Main users

- teams using Codex, Claude Code, Cursor, n8n, LangChain, CrewAI, AutoGen, or similar
- technical AI governance teams
- consultants implementing AI-agent controls

## Main use cases

- record tool calls
- record shell commands
- record approvals
- record blocked actions
- record risky actions
- generate agent activity timeline
- create governance evidence from agent runs

## MVP

- event schema
- CLI validate command
- sample agent run
- timeline report
- risk labels
- approval event support

## Future paid use

- dashboard
- team approvals
- tamper-evident logs
- alerts
- audit exports

## Promotion

Turn AI agent actions into audit-ready evidence.
