-- Enable pgvector extension
create extension if not exists vector;

-- Memory table
create table if not exists agent_memories (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  type text not null check (type in ('episodic', 'semantic', 'procedural')),
  content text not null,
  embedding vector(768),
  domain text,
  outcome text check (outcome in ('approved', 'rejected', 'auto_executed', null)),
  confidence integer,
  created_at timestamptz default now()
);

-- Index for fast similarity search
create index on agent_memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC function for similarity search
create or replace function match_agent_memories(
  query_embedding vector(768),
  match_agent text,
  match_count int default 5,
  similarity_threshold float default 0.7
)
returns table (
  id uuid,
  content text,
  agent text,
  type text,
  similarity float,
  created_at timestamptz
)
language sql stable
as $$
  select
    id,
    content,
    agent,
    type,
    1 - (embedding <=> query_embedding) as similarity,
    created_at
  from agent_memories
  where agent = match_agent
    and 1 - (embedding <=> query_embedding) > similarity_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
