"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  sendCollaborationMessageAction,
  type SendMessageActionState,
} from "@/app/actions/messages";
import type { CollaborationMessage } from "@/lib/collaboration-messages";

const initialState: SendMessageActionState = {
  status: "idle",
  message: null,
};

const timestampFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatTimestamp(value: string | null) {
  return value ? timestampFormat.format(new Date(value)) : "Just now";
}

export function MessageThread({
  collaborationId,
  creatorId,
  creatorName,
  currentUserId,
  messages,
}: {
  collaborationId: string;
  creatorId: string;
  creatorName: string;
  currentUserId: string;
  messages: CollaborationMessage[];
}) {
  const [state, formAction, pending] = useActionState(
    sendCollaborationMessageAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <section className="nn-card mt-12 overflow-hidden rounded-[1.25rem]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-nn-line border-b px-6 py-6 sm:px-8">
        <div>
          <h2 className="nn-display text-3xl text-nn-ink">Conversation</h2>
          <p className="mt-2 text-sm text-nn-muted">
            Discuss this collaboration with the people involved.
          </p>
        </div>
        <span className="nn-chip nn-num">{messages.length}</span>
      </div>

      {messages.length ? (
        <ol className="grid max-h-[32rem] list-none gap-4 overflow-y-auto bg-nn-paper p-6 sm:p-8">
          {messages.map((message) => {
            const fromCreator = message.senderId === creatorId;
            const fromCurrentUser = message.senderId === currentUserId;
            const sender = fromCreator ? creatorName : "Brand team";

            return (
              <li
                key={message.id}
                className={`max-w-[90%] rounded-[var(--nn-radius-sm)] px-5 py-4 sm:max-w-[75%] ${
                  fromCurrentUser
                    ? "ml-auto bg-nn-blue text-white"
                    : "border border-nn-line bg-nn-white text-nn-ink"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <p className={`text-xs font-bold ${fromCurrentUser ? "text-white" : "text-nn-ink"}`}>
                    {fromCurrentUser ? "You" : sender}
                  </p>
                  <time
                    dateTime={message.createdAt ?? undefined}
                    className={`nn-num text-[0.68rem] ${
                      fromCurrentUser ? "text-white/80" : "text-nn-muted"
                    }`}
                  >
                    {formatTimestamp(message.createdAt)} UTC
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="bg-nn-paper px-6 py-10 sm:px-8">
          <p className="text-sm font-bold text-nn-ink">No messages yet.</p>
          <p className="mt-2 text-sm text-nn-muted">Start the conversation about this collaboration.</p>
        </div>
      )}

      <form ref={formRef} action={formAction} className="border-nn-line border-t px-6 py-6 sm:px-8">
        <input type="hidden" name="collaborationId" value={collaborationId} />
        <label
          htmlFor={`message-${collaborationId}`}
          className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase"
        >
          New message
        </label>
        <textarea
          id={`message-${collaborationId}`}
          name="body"
          rows={4}
          maxLength={2000}
          required
          disabled={pending}
          placeholder="Write a message about this collaboration…"
          className="mt-2 min-h-28 w-full resize-y rounded-[var(--nn-radius-sm)] border border-nn-line-strong bg-nn-white px-4 py-3 text-sm leading-6 text-nn-ink outline-none transition-colors placeholder:text-nn-muted/60 hover:border-nn-blue focus:border-nn-blue focus:ring-3 focus:ring-nn-blue/25 disabled:opacity-60"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite">
            {state.message ? (
              <p
                className={`text-sm ${
                  state.status === "error" ? "text-danger" : "font-bold text-nn-blue"
                }`}
              >
                {state.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="nn-btn nn-btn-primary min-h-13 py-3 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send message"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
