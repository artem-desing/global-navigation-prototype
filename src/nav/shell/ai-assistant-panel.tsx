'use client';

import { useState } from 'react';
import { Button } from '@wallarm-org/design-system/Button';
import { Textarea } from '@wallarm-org/design-system/Textarea';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { ArrowUp, X } from '@wallarm-org/design-system/icons';
import { Sparkles } from '@/nav/manifest/custom-icons';

type ChatMessage = {
  id: string;
  author: 'user' | 'assistant';
  body: string;
};

const SUGGESTIONS = [
  'Summarize last week’s top API risks',
  'Which routes saw the biggest BOLA spike today?',
  'Draft a policy that blocks credential stuffing on /login',
];

export interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIAssistantPanel({ open, onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const id = `${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `${id}-u`, author: 'user', body: trimmed },
      {
        id: `${id}-a`,
        author: 'assistant',
        body: 'Mock response — this prototype doesn’t talk to a real model. The shipped assistant will answer here, with citations to the relevant findings, policies, and routes.',
      },
    ]);
    setDraft('');
  };

  return (
    <aside
      aria-label="AI assistant"
      aria-hidden={!open}
      className="shrink-0 overflow-hidden border-l transition-[width] duration-200 ease-out"
      style={{
        width: open ? 440 : 0,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <div
        className="flex h-full flex-col"
        style={{ width: 440 }}
      >
        <header
          className="flex h-48 shrink-0 items-center justify-between gap-8 border-b px-16"
          style={{ borderColor: 'var(--color-border-primary-light)' }}
        >
          <div className="flex items-center gap-8">
            <Sparkles size="sm" />
            <Text size="md" weight="medium" color="primary">
              AI Assistant
            </Text>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI assistant"
            className="flex h-24 w-24 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-light-primary)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size="sm" />
          </button>
        </header>

        <div className="flex-1 overflow-auto px-16 py-16">
          {messages.length === 0 ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="flex flex-col gap-16">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>

        <footer
          className="shrink-0 border-t px-16 py-12"
          style={{ borderColor: 'var(--color-border-primary-light)' }}
        >
          <form
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything about your traffic, findings, or policies…"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
            />
            <div className="flex items-center justify-between gap-8">
              <Text size="xs" color="secondary">
                AI can make mistakes — always verify.
              </Text>
              <Button
                type="submit"
                variant="primary"
                color="brand"
                disabled={!draft.trim()}
                aria-label="Send message"
              >
                <ArrowUp size="sm" />
              </Button>
            </div>
          </form>
        </footer>
      </div>
    </aside>
  );
}

function EmptyState({ onPick }: { onPick: (body: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-24 py-32">
      <div
        className="flex h-64 w-64 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-bg-light-primary)' }}
      >
        <Sparkles size="lg" />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading size="lg" weight="medium">
          What do you want to know?
        </Heading>
        <Text size="sm" color="secondary">
          Mock assistant — pick a prompt or type your own.
        </Text>
      </div>
      <div className="flex w-full flex-col gap-8">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-md border px-12 py-8 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
            style={{
              borderColor: 'var(--color-border-primary-light)',
              backgroundColor: 'var(--color-bg-surface-1)',
            }}
          >
            <Text size="sm" color="primary">
              {s}
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.author === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] rounded-md px-12 py-8"
        style={{
          backgroundColor: isUser
            ? 'var(--color-bg-light-primary)'
            : 'var(--color-bg-surface-2)',
          border: '1px solid var(--color-border-primary-light)',
        }}
      >
        <Text size="sm" color="primary">
          {message.body}
        </Text>
      </div>
    </div>
  );
}
