FROM langchain/langgraphjs-api:20
ADD . /deps/agent-rag
ENV LANGSERVE_GRAPHS='{"agent":"./apps/agents/src/react-agent/graph.ts:graph","memory_agent":"./apps/agents/src/memory-agent/graph.ts:graph","retrieval_agent":"./apps/agents/src/retrieval-agent/graph.ts:graph","research_agent":"./apps/agents/src/research-agent/retrieval-graph/graph.ts:graph","research_agent_indexer":"./apps/agents/src/research-agent/index-graph/graph.ts:graph"}'
WORKDIR /deps/agent-rag
RUN npm i
RUN (test ! -f /api/langgraph_api/js/build.mts && echo "Prebuild script not found, skipping") || tsx /api/langgraph_api/js/build.mts