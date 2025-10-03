# Design Diagrams Index

Welcome to the design documentation for the Intelligent Booking Assistant. This directory contains comprehensive architecture and process flow diagrams.

## 📚 Available Diagrams

### 1. [System Architecture Diagram](./SYSTEM-ARCHITECTURE-DIAGRAM.md)
**Best for**: Understanding the technical implementation

**Contains**:
- Complete layer-by-layer architecture (Client → API → AI → Data)
- Component relationships and dependencies
- Technology stack details
- Database schema overview
- Data flow examples
- Performance optimizations

**Use this when you need to**:
- Understand how components interact
- Design new features
- Troubleshoot technical issues
- Onboard new developers
- Plan system integrations

---

### 2. [Process Flow Diagram](./PROCESS-FLOW-DIAGRAM.md)
**Best for**: Understanding the user journey and business logic

**Contains**:
- Complete 4-section user flow with decision points
- Validation gates and advancement triggers
- Error handling and recovery flows
- State transition logic
- Message flow examples (happy path)
- Conversion optimization strategies

**Use this when you need to**:
- Understand user experience
- Design conversation flows
- Troubleshoot UX issues
- Optimize conversion rates
- Plan A/B tests

---

### 3. [Architecture Overview](./ARCHITECTURE-OVERVIEW.md)
**Best for**: Quick reference and high-level understanding

**Contains**:
- Condensed view of both architecture and process
- Key algorithms (recommendation scoring, profile extraction)
- Database schema summary
- UI component tree
- State management flow
- Example user journey timeline
- Success metrics

**Use this when you need to**:
- Quick reference during development
- High-level system overview
- Performance targets
- Component organization
- Success metric tracking

---

## 🎯 Quick Navigation Guide

### "I want to understand..."

| Topic | Go to | Section |
|-------|-------|---------|
| How components communicate | System Architecture | Data Flow Example |
| How users book a trip | Process Flow | User Journey |
| How recommendations work | Architecture Overview | Key Algorithms |
| Database structure | System Architecture | Data Layer |
| The 4 booking sections | Process Flow | Section Details |
| API endpoints | System Architecture | Application Layer |
| User journey timeline | Architecture Overview | Example Journey |
| Validation rules | Process Flow | State Transitions |
| Tech stack | Architecture Overview | Key Technologies |
| Performance targets | Architecture Overview | Performance Targets |

---

## 🚀 Getting Started

### For New Developers
1. Read [Architecture Overview](./ARCHITECTURE-OVERVIEW.md) first for high-level understanding
2. Deep dive into [System Architecture](./SYSTEM-ARCHITECTURE-DIAGRAM.md) for implementation details
3. Study [Process Flow](./PROCESS-FLOW-DIAGRAM.md) to understand business logic

### For Product Managers
1. Start with [Process Flow](./PROCESS-FLOW-DIAGRAM.md) to understand user experience
2. Review [Architecture Overview](./ARCHITECTURE-OVERVIEW.md) for success metrics
3. Reference [System Architecture](./SYSTEM-ARCHITECTURE-DIAGRAM.md) for technical constraints

### For Designers
1. Read [Process Flow](./PROCESS-FLOW-DIAGRAM.md) for user journey and interactions
2. Check [Architecture Overview](./ARCHITECTURE-OVERVIEW.md) for UI component tree
3. Review section requirements for UI design needs

---

## 📊 Diagram Formats

All diagrams use **Mermaid** syntax, which renders natively in:
- ✅ GitHub
- ✅ GitLab
- ✅ VS Code (with Mermaid extension)
- ✅ Notion
- ✅ Obsidian
- ✅ Most modern markdown viewers

### Viewing Options

**Option 1: GitHub/GitLab**
Simply view the `.md` files - diagrams render automatically

**Option 2: VS Code**
1. Install "Markdown Preview Mermaid Support" extension
2. Open any diagram file
3. Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows)

**Option 3: Online Mermaid Editor**
1. Copy diagram code blocks
2. Paste into [mermaid.live](https://mermaid.live)
3. Export as PNG/SVG if needed

---

## 🔄 Diagram Update Policy

These diagrams should be updated when:
- [ ] New sections or features are added
- [ ] Database schema changes
- [ ] Technology stack changes
- [ ] API routes are added/modified
- [ ] User flow changes significantly
- [ ] New integrations are added

**Update Process**:
1. Edit the Mermaid code in the relevant `.md` file
2. Test rendering in VS Code or GitHub preview
3. Update related documentation if needed
4. Commit with descriptive message: `docs: update [diagram name] for [change]`

---

## 📖 Related Documentation

After reviewing these diagrams, you may want to read:

- [Technical Architecture (SQLite Edition)](./TECHNICAL-ARCHITECTURE-SQLITE.md) - Implementation guide
- [Product Requirements Document](./PRD-Intelligent-Booking-Assistant.md) - Feature requirements
- [Quick Start Guide](./QUICK-START-SQLITE.md) - Development setup
- [Response Formatting Guide](./RESPONSE-FORMATTING-GUIDE.md) - AI response standards
- [MVP Status](./MVP-STATUS.md) - Current implementation status

---

## 🎨 Diagram Color Coding

Throughout the diagrams, we use consistent color coding:

| Color | Hex | Usage |
|-------|-----|-------|
| 🔵 Blue | `#e3f2fd` | Section 1 / Client Layer |
| 🟠 Orange | `#fff3e0` | Section 2 / API Layer |
| 🟣 Purple | `#f3e5f5` | Section 3 / AI Layer |
| 🟢 Green | `#e8f5e9` | Section 4 / Data Layer |
| 🟡 Yellow | `#fff9c4` | Decision Points |
| 🔴 Red | `#ffebee` | Endpoints / Critical Paths |

---

## 📝 Feedback & Questions

If you have questions about the diagrams or notice anything missing:

1. **For technical clarifications**: Create an issue with label `documentation`
2. **For diagram improvements**: Submit a PR with proposed changes
3. **For quick questions**: Ask in the team chat with `@docs` tag

---

## 🎯 Common Use Cases

### Use Case 1: Planning a New Feature
**Steps**:
1. Review [Process Flow](./PROCESS-FLOW-DIAGRAM.md) to see where it fits
2. Check [System Architecture](./SYSTEM-ARCHITECTURE-DIAGRAM.md) for affected components
3. Update diagrams if feature changes flow or architecture

### Use Case 2: Debugging an Issue
**Steps**:
1. Identify which section/layer the issue occurs in
2. Review [System Architecture](./SYSTEM-ARCHITECTURE-DIAGRAM.md) for data flow
3. Check [Process Flow](./PROCESS-FLOW-DIAGRAM.md) for validation gates
4. Trace through the sequence diagram

### Use Case 3: Onboarding New Team Member
**Recommended Reading Order**:
1. [Architecture Overview](./ARCHITECTURE-OVERVIEW.md) - 15 min
2. [System Architecture](./SYSTEM-ARCHITECTURE-DIAGRAM.md) - 30 min
3. [Process Flow](./PROCESS-FLOW-DIAGRAM.md) - 30 min
4. Code walkthrough with diagrams as reference

---

## 📊 Diagram Statistics

- **Total Diagrams**: 7 (across 3 documents)
- **Mermaid Graphs**: 4
- **Sequence Diagrams**: 1
- **Flowcharts**: 2
- **Lines of Documentation**: ~1,500
- **Last Updated**: October 3, 2025

---

**Need help?** Open an issue or ask in the team channel!

---

[← Back to Documentation Index](./00-README-START-HERE.md)

