# Sentinel Flow

Sentinel Flow is a polished static frontend prototype for an AI security agent workspace. It is designed for security-agent product exploration, workflow validation, and operational walkthroughs.

The interface opens directly into a working security operations dashboard. It shows terminal activity, multi-agent orchestration, incident triage, evidence extraction, remediation suggestions, and an animated threat graph.

## Capabilities

- Security incident triage with AI agents
- Long-context reasoning across code, logs, and rule libraries
- Multi-agent workflow orchestration
- Rule generation, remediation planning, and verification outputs
- A self-contained UI that can run without any backend

## Why this repo exists

This project was created as a lightweight product prototype for teams evaluating AI-assisted security operations. It makes the core workflow visible without requiring backend services, private security data, or access to internal tools.

The prototype is intentionally focused on a concrete security workflow:

1. ingest incident context
2. correlate code, logs, and detection rules
3. coordinate multiple specialized agents
4. generate remediation and verification output
5. preserve a readable operational record

## Run locally

No build step is required.

Open [`index.html`](./index.html) directly in a browser.

## Workflow

1. Open the page
2. Click `执行一次研判流程`
3. Switch between incident cards in the queue
4. Review the terminal log, workflow rail, result panel, and threat canvas

## Operational Views

Core views in the workspace:

- main dashboard with terminal activity
- multi-agent workflow rail
- incident evidence and recommendations
- animated threat graph and risk score

## Stack

- HTML
- CSS
- Vanilla JavaScript
- Lucide icons via CDN

## Notes

This is intentionally frontend-only. The goal is to present a credible AI-powered security workflow with minimal setup friction.
