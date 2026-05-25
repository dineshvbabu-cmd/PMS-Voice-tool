# HarborOps Fleet Copilot

## Product Summary

**Working name:** HarborOps Fleet Copilot

**Category:** Cross-platform AI voice copilot plugin for PMS, inventory, procurement, and technical operations systems

**Positioning:** A voice-first operational layer that plugs into existing maritime PMS and procurement products to let crews, superintendents, and buyers query, act, and follow up using natural language with audit-grade controls.

**Core promise:** Do not replace the PMS. Make every PMS easier to use, faster to act on, and better at surfacing risk.

## Product Vision

Build a plugin product that can sit on top of any major maritime PMS or procurement stack and provide:

- voice and chat access to maintenance, defects, and procurement workflows
- cross-module reasoning over jobs, defects, requisitions, inventory, and PO status
- controlled action execution with approvals and audit trails
- analytics answers based on live operational data
- a low-friction user experience for vessel and office teams

## Problem Statement

Most PMS and procurement systems are data-rich but operationally slow:

- crews spend too long navigating screens to find due jobs and instructions
- overdue work is visible but not conversationally explorable
- postponement and defect workflows are formal but cumbersome
- requisitions and PO follow-up require multiple role handoffs
- office users cannot quickly ask, "what is late, why is it late, and what action should I take next?"

The product should convert structured maritime operational data into an action-ready, voice-driven assistant without forcing customers to replace their existing systems.

## Product Goals

### Business Goals

- Sell as an add-on to PMS, procurement, and fleet management vendors
- Sell direct to ship owners and managers as a middleware plugin
- Reduce operator time-to-answer and time-to-action
- Increase customer stickiness for host PMS platforms
- Create a premium AI revenue line with per-vessel or per-user pricing

### User Goals

- Ask for due jobs, overdue jobs, instructions, and job descriptions instantly
- report defects quickly
- raise postponement requests correctly
- raise requisitions from jobs or inventory needs
- follow up on requisitions and purchase orders conversationally
- ask analytical questions without building reports manually

### Product Goals

- support multiple PMS and procurement vendors through a connector framework
- keep writes safe, approved, and fully auditable
- be deployable in office-first mode and then vessel-connected mode
- support both text and voice interaction

## Target Users

### Vessel Users

- Chief Engineer
- Second Engineer
- Master
- Electrical Officer
- Technical Officers
- Storekeeper

### Office Users

- Superintendent
- Fleet Manager
- Procurement Officer
- Technical Buyer
- HSQE / Compliance Manager
- DPA / management reviewers

### Partner / Buyer Users

- PMS vendors
- maritime digitalization providers
- ship management companies
- technical management departments

## Jobs To Be Done

- "Tell me what maintenance is due today for this vessel."
- "Read the instructions and description for this job."
- "Show me all critical overdue items and why they are pending."
- "Raise a defect and link it to the equipment."
- "Submit a postponement request because spares are not on board."
- "Raise a requisition linked to this job."
- "What urgent requisitions are stuck without status change?"
- "Which POs are overdue for delivery and what is the vessel impact?"
- "Why is this vessel's completion rate falling?"

## Scope

### In Scope

- PMS query assistant
- work-order detail readout
- overdue and backlog explanation
- defect reporting workflow
- postponement workflow
- requisition creation workflow
- procurement follow-up workflow
- analytics Q&A over PMS and procurement data
- plugin connector framework
- audit trail, approvals, and policy controls
- pitch/demo environment

### Out of Scope For MVP

- autonomous action without user confirmation
- direct editing of regulated dates without workflow controls
- full offline onboard speech inference
- automatic vendor negotiation emails
- class-society portal write-back beyond supported APIs

## Product Packaging Strategy

### Option A: OEM Plugin For PMS Vendors

- embedded widget inside host PMS UI
- host vendor keeps core users, plugin adds AI layer
- revenue share or white-label licensing

### Option B: Independent Middleware Product

- separate web app with SSO into PMS
- reads and writes through APIs or database adapters
- sold directly per vessel, per fleet, or per seat

### Option C: Office-First Procurement Copilot

- limited initial scope to requisitions, spares, and PO follow-up
- faster ROI story for ship managers

## Multi-System Plugin Architecture

### Architecture Principle

Do not build one monolithic PMS-specific assistant. Build a canonical operations layer with vendor connectors underneath it.

### Logical Layers

1. **Experience layer**
   - web widget
   - mobile web
   - embedded PMS panel
   - voice console

2. **AI orchestration layer**
   - conversation manager
   - intent router
   - tool execution engine
   - confirmation and approval policy engine
   - analytics answerer

3. **Canonical domain layer**
   - jobs
   - equipment
   - defects
   - postponements
   - inventory items
   - requisitions
   - purchase orders
   - approvals
   - users and roles

4. **Connector layer**
   - PMS connectors
   - procurement connectors
   - inventory connectors
   - ERP / finance connectors
   - document and email connectors

5. **Governance layer**
   - audit log
   - prompt and policy versioning
   - trace store
   - access control
   - evaluation suite

## Canonical Domain Model

The product should expose a vendor-neutral schema. Every connector maps source fields into this schema.

### Core Objects

- `Vessel`
- `Equipment`
- `MaintenanceJob`
- `JobInstructionBundle`
- `Defect`
- `PostponementRequest`
- `InventoryItem`
- `Requisition`
- `PurchaseOrder`
- `ApprovalTask`
- `OperationalAlert`
- `Supplier`

### Minimum Canonical Fields

#### MaintenanceJob

- `job_id`
- `source_system`
- `source_record_id`
- `vessel_id`
- `equipment_id`
- `job_type`
- `priority`
- `status`
- `due_date`
- `raised_date`
- `closed_date`
- `instruction_text`
- `description_text`
- `linked_defect_id`
- `linked_requisition_ids`
- `blocking_reason`

#### Defect

- `defect_id`
- `vessel_id`
- `equipment_id`
- `description`
- `severity`
- `status`
- `due_date`
- `linked_job_id`

#### PostponementRequest

- `request_id`
- `job_id`
- `requested_by`
- `requested_date`
- `reason_code`
- `reason_text`
- `new_due_date`
- `approval_status`
- `approved_by`

#### Requisition

- `req_id`
- `vessel_id`
- `department`
- `req_type`
- `status`
- `priority_score`
- `req_date`
- `source_job_id`
- `source_inventory_alert`
- `line_items`
- `approval_state`

#### PurchaseOrder

- `po_id`
- `req_id`
- `supplier_id`
- `status`
- `issue_date`
- `eta_date`
- `delivery_status`
- `currency`
- `total_amount`

## Connector Strategy

### Supported Integration Modes

- REST API
- GraphQL API
- database read replica / views
- flat-file exchange
- email parsing for limited workflows

### Connector Packaging

Each connector should provide:

- auth adapter
- schema mapper
- tool surface
- sync rules
- health checks
- permissions matrix

### First Connectors To Build

- generic REST PMS connector
- generic REST procurement connector
- SQL view connector
- adapter for inventory and requisitions

## Product Features

## 1. Voice And Chat Query Assistant

### Purpose

Allow users to ask natural-language questions against PMS and procurement data.

### Example Queries

- "What jobs are due in the next seven days on vessel A?"
- "Read the instructions for the purifier overhaul."
- "Show critical overdue items blocked by awaiting spares."
- "Which urgent requisitions have had no update in seven days?"
- "What PO delays are affecting critical maintenance?"

### Functional Requirements

- parse user intent from text or speech
- detect vessel, job, equipment, urgency, date range, status, supplier, department
- ask a short clarifying question when required
- respond with spoken and visual summaries
- provide drill-down detail links

## 2. Due And Overdue Maintenance Reporting

### Functional Requirements

- list due jobs by date range, vessel, equipment, department, and priority
- list overdue jobs by age bucket and criticality
- explain why jobs are overdue when data exists
- expose blocking reasons such as awaiting spares, manpower, class approval
- support "top N overdue" summaries for management

## 3. Work Order Readout

### Functional Requirements

- read job title, due date, equipment, priority
- read instructions and description
- summarize linked records such as defects, survey items, and deferral history
- allow users to request parts consumed, time entries, and job history

## 4. Defect Reporting And Closure

### Functional Requirements

- create a defect from voice or chat input
- capture vessel, equipment, description, severity, immediate impact
- create or link a corrective job
- support defect closure with notes, evidence, and approvals if required
- maintain full audit trail

## 5. Postponement Workflow

### Functional Requirements

- never modify regulated due dates directly
- create a postponement request object
- capture reason code, free-text reason, requested new date, requestor
- enforce approval policy
- notify approving role
- reflect approval outcome back into source system

### Key Policy Rule

The product must treat due-date changes as workflow events, not free edits.

## 6. Requisition Raising

### Functional Requirements

- create requisitions from maintenance jobs
- create requisitions from defect correction needs
- create requisitions from low-stock inventory situations
- suggest likely parts based on job type, equipment, and prior consumption
- attach requisition to source job when applicable
- support line item quantities, urgency, and supplier preference

## 7. Procurement Follow-Up

### Functional Requirements

- answer status queries for requisitions and POs
- flag aged requisitions with no status movement
- identify critical reqs with stalled approval
- identify POs delayed against ETA
- show vessel impact of late supply
- recommend next action

### Example Queries

- "What urgent requisitions are older than seven days?"
- "Which POs are delaying critical jobs?"
- "Follow up on all steering gear parts requisitions."

## 8. Analytics Q&A

### Functional Requirements

- answer why and what-changed questions from operational data
- calculate trends, counts, ratios, and comparative rankings
- cite the source modules used
- separate factual answers from model inference

### Example Analytics Queries

- "Why is maintenance completion low on this vessel?"
- "Which suppliers are causing most delays?"
- "What categories drive repeated breakdowns?"
- "How many overdue jobs are blocked by awaiting spares?"
- "What is the relationship between backlog and procurement delays?"

## User Experience Requirements

### Interaction Modes

- push-to-talk voice
- text chat
- sample quick actions
- role-based dashboards with embedded assistant

### UX Principles

- concise spoken responses
- structured visual response cards
- explicit confirmation before writes
- visible source citations
- visible tool/action trace for trust

### Required UI Components

- conversation panel
- transcript panel
- source data panel
- confirmation modal
- audit / activity feed
- role-specific quick actions

## Voice Product Strategy

## Recommended Approach

For the sellable product, use two modes:

### Mode 1: Controlled Chained Voice Workflow

Use:

- speech-to-text
- text reasoning and tool execution
- text-to-speech

This is the best default for approval-heavy flows, durable transcripts, and deterministic action control. OpenAI's current voice-agent guidance explicitly recommends the chained path for those cases. Source: https://developers.openai.com/api/docs/guides/voice-agents

### Mode 2: Natural Realtime Voice Layer

Use for premium deployments:

- low-latency voice sessions
- more conversational browsing and follow-up
- same controlled backend tools for any write action

## Voice Model Stack

### Recommended MVP Stack

- speech-to-text: `gpt-4o-mini-transcribe`
- reasoning and tool use: `gpt-5.4-mini`
- speech output: `gpt-4o-mini-tts`

### Recommended Premium Stack

- speech-to-speech session: `gpt-realtime-2`
- action planner fallback: `gpt-5.4-mini` or `gpt-5.5` for complex multi-step office analysis

## How The Voice Model Should Be "Trained"

This product should **not** plan around training an acoustic voice model from scratch.

The right approach is:

### Layer 1: Speech Recognition Adaptation

- use strong base transcription
- maintain a maritime lexicon and normalization layer
- normalize terms like:
  - FO purifier / fuel oil purifier
  - M/E / main engine
  - C/E / chief engineer
  - ROB
  - O-rings
  - makers, part numbers, vessel names

### Layer 2: Intent And Entity Evaluation

Build labeled examples for:

- due-job lookup
- overdue lookup
- work-order detail lookup
- defect creation
- postponement request
- requisition creation
- procurement follow-up
- analytics question

### Layer 3: Tool Schema Design

The real reliability comes from strict tool contracts, not freeform model behavior.

- define narrow tools
- require structured parameters
- enforce confirmations before writes

### Layer 4: Domain Behavior Tuning

Tune by:

- system prompts
- role prompts
- domain dictionaries
- output schemas
- evaluation loops
- transcript review

### Training Data To Collect

- real user utterance
- normalized transcript
- intended action
- extracted entities
- expected tool call
- expected safe response
- whether clarification was required
- final human outcome

### Fine-Tuning Guidance

Do not make model fine-tuning the phase-1 dependency.

Use this order:

1. prompt and tool design
2. transcript normalization
3. evaluation harness
4. selective distillation or fine-tuning of the intent/extraction layer if needed

Important current note: OpenAI's platform documentation says the fine-tuning platform is being wound down for new users, so the product should not rely on fine-tuning as a required pillar. Source: https://developers.openai.com/api/docs/pricing

## Evaluation And Accuracy Plan

### Metrics

- transcription word error rate on maritime terms
- intent classification accuracy
- entity extraction accuracy
- tool-call precision
- confirmation compliance
- false-write rate
- answer grounding rate
- user time saved

### Gold Test Sets

Build curated evaluation sets for:

- vessel names and accents
- maintenance terms
- equipment aliases
- date references
- part codes
- supplier names
- postponement edge cases
- procurement follow-up edge cases

### Human Review Loop

- review failed transcripts weekly
- review unsafe write attempts
- review unresolved clarifications
- update lexicon, prompts, and schemas

## Tooling And API Design

The assistant should only access systems through explicit tools.

### Minimum Tool Set

- `search_jobs`
- `get_job_detail`
- `search_overdue_jobs`
- `create_defect`
- `close_defect`
- `submit_postponement_request`
- `create_requisition`
- `search_requisitions`
- `search_purchase_orders`
- `explain_backlog`
- `explain_procurement_delay`

### Tool Design Rules

- use JSON schemas for inputs
- validate all required fields server-side
- disable silent writes
- use one tool per controlled action when possible
- separate search tools from write tools

OpenAI's function-calling guidance supports structured tool schemas, and newer models support strict structured outputs on the text reasoning side. Sources:

- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/models/gpt-5.4-mini

## Security And Governance

### Authentication

- SSO with Azure AD / Entra ID or customer IdP
- host-system token exchange for embedded deployments

### Authorization

- role-based access control
- vessel scope restrictions
- office vs vessel write controls
- approval routing by role and urgency

### Audit

- transcript log
- normalized transcript
- tool calls
- source records touched
- confirmation event
- final write payload
- user identity
- timestamp

### Safety Controls

- no direct due-date edits
- no closure without required note fields
- no requisition approval unless user role permits
- explicit rejection when user asks beyond authority

## Data And Analytics Strategy

## Data Types Used For Analysis

- job orders
- scheduled task calendars
- equipment hierarchy
- counter and running-hour records
- backlog aging
- defects and corrective actions
- inventory levels
- requisition headers and line items
- purchase orders
- supplier performance
- approval timestamps
- delivery dates

## Query Understanding Strategy

User questions should be classified into:

- retrieval
- explanation
- comparison
- trend
- recommendation
- action

### Example Mapping

- "What is due tomorrow?" -> retrieval
- "Why is this vessel's backlog growing?" -> explanation
- "Compare overdue critical jobs across fleet." -> comparison
- "How has requisition aging changed this month?" -> trend
- "What should I prioritize?" -> recommendation
- "Raise a requisition for this job." -> action

## Analytics Engine Behavior

For analysis queries:

- retrieve relevant filtered data
- compute metrics deterministically in code
- let the model explain the computed result
- label assumptions clearly

This keeps analytics accurate and pitchable.

## Non-Functional Requirements

- response time under 3 seconds for common query flows
- under 6 seconds for typical write-with-confirmation flow before final submit
- multilingual-ready transcript normalization
- scalable to fleet-wide data
- resilient to noisy vessel environments
- configurable per customer workflow

## Deployment Modes

### Mode A: Embedded Web Widget

- iframe or component inside PMS
- best for vendor partnerships

### Mode B: Standalone Portal

- separate AI operations workspace
- best for direct sales

### Mode C: Mobile-Friendly Web Console

- officer-friendly, quick action flows

## Commercial Model

### Pricing Options

- per vessel per month
- per active user per month
- per transaction volume
- base platform + premium realtime voice add-on

### Suggested Packaging

- Core: text + voice query assistant
- Pro: action workflows for defects, postponements, requisitions
- Enterprise: realtime voice, analytics, vendor connectors, white-labeling

## MVP Definition

### MVP Features

- due / overdue job voice and chat query
- work-order detail readout
- defect reporting
- postponement request creation
- requisition creation from job
- procurement follow-up on requisitions and POs
- analytics for backlog and procurement delay reasons
- audit log

### MVP Success Criteria

- 80 percent+ correct intent routing in pilot
- 90 percent+ correct job detail retrieval
- 0 unsafe silent writes
- measurable reduction in time spent finding and updating operational records

## Roadmap

### Phase 1

- canonical model
- generic connectors
- office-first deployment
- chained voice workflow
- demo and pilot customers

### Phase 2

- embedded vendor SDK
- realtime voice premium mode
- supplier follow-up automation
- multilingual workflows

### Phase 3

- predictive recommendations
- cross-vessel benchmarking
- advanced procurement optimization
- class / survey / compliance expansion

## Demo Scope For Sales

The sales demo should show:

- due jobs query
- overdue critical maintenance
- read instructions and description
- defect reporting
- postponement request with approval
- requisition creation tied to a job
- procurement follow-up and PO delay impact
- analytics explanation from live-style data

## Open Questions For Productization

- which PMS vendors should be targeted first
- whether to lead with procurement or maintenance
- whether white-label demand is stronger than direct SaaS
- which customer data fields are consistently available across vendors
- whether to sell office-only first, then vessel users second

## Recommendation

Lead with a **vendor-neutral office-first plugin** that works across PMS + inventory + procurement, then add vessel voice. That gives you the strongest commercial story:

- low integration friction
- immediate management ROI
- safer action workflows
- best pitch for both direct customers and PMS vendors
