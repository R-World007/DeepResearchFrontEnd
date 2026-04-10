# G3 Research Agent Architecture Evaluation

## Architecture Overview
The G3 Research Agent is designed to handle complex, multi-part queries by decomposing them into manageable steps while strictly adhering to memory and token constraints.

## Memory Strategy: Summarization Cascade
We implemented a **Summarization Cascade** approach for memory management.
- **Mechanism**: As the research session progresses, older reasoning steps are summarized into a "Global Context" buffer.
- **Constraints**: The system maintains a maximum of 2,000 context tokens per query to ensure performance and cost-efficiency.
- **Trade-offs**: 
    - *Pros*: Reduces token costs significantly; prevents context window overflow; keeps the most relevant information "near" the current reasoning step.
    - *Cons*: Potential loss of granular detail from early research steps as they are compressed.

## Token & Budget Constraints
- **Self-defined Limit**: Max 2,000 context tokens per reasoning loop.
- **Cost Target**: Average research session < $0.05.
- **Implementation**: The UI provides real-time visibility into token usage and estimated costs per step, ensuring transparency for the user.

## Task Decomposition
The agent uses a hierarchical decomposition strategy:
1. **Query Analysis**: Breaking the prompt into sub-questions.
2. **Parallel Retrieval**: Fetching data for sub-questions (simulated in this UI prototype).
3. **Sequential Reasoning**: Synthesizing data while respecting the memory buffer.

## UI/UX Decisions
- **Transparency**: Every internal step (decomposition, retrieval, reasoning) is visible to the user.
- **Minimalism**: A clean, sidebar-driven interface inspired by modern research tools (like Perplexity or Elicit).
- **Feedback Loops**: Real-time status indicators and token counters provide immediate feedback on the agent's "thinking" process.
