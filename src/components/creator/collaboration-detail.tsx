import Link from "next/link";

import { MessageThread } from "@/components/collaborations/message-thread";
import { CreatorShell } from "@/components/creator/shell";
import { SubmitContentForm } from "@/components/creator/submit-content-form";
import type { CollaborationMessage } from "@/lib/collaboration-messages";
import {
  formatCollaborationDate,
  formatCollaborationMoney,
} from "@/lib/collaborations/format";
import type { CreatorCollaboration } from "@/lib/creator/data";

const statusContent = {
  accepted: {
    label: "Accepted",
    next: "Publish the sponsored post, then submit its public link.",
  },
  content_submitted: {
    label: "Awaiting brand approval",
    next: "Your published post is with the brand for approval and settlement.",
  },
  completed: {
    label: "Completed",
    next: "The fee has been recorded in your payout ledger.",
  },
} as const;

export function CreatorCollaborationDetailView({
  creatorId,
  creatorName,
  collaboration,
  messages,
}: {
  creatorId: string;
  creatorName: string;
  collaboration: CreatorCollaboration;
  messages: CollaborationMessage[];
}) {
  const status = statusContent[collaboration.status];
  const offer = collaboration.offer
    ? { cents: collaboration.offer.feeCents, currency: collaboration.offer.currency }
    : null;

  return (
    <CreatorShell
      creatorName={creatorName}
      activeHref="/creator/collaborations"
      eyebrow="Creator collaboration"
      detail={collaboration.campaignName}
      marker={status.label}
    >
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <Link
          href="/creator/collaborations"
          className="text-xs font-bold tracking-[0.09em] text-nn-muted uppercase hover:text-nn-blue"
        >
          ← Back to collaborations
        </Link>

        <div className="mt-8 grid gap-8 border-nn-line border-b pb-12 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-nn-muted uppercase">
              <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" />
              {status.label}
            </p>
            <h1 className="nn-display mt-4 text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              {collaboration.campaignName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-nn-muted">
              {collaboration.deliverables}
            </p>
          </div>
          <aside className="nn-card rounded-[1.25rem] p-6 sm:p-8">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
              Next action
            </p>
            <p className="mt-3 text-sm leading-6 text-nn-ink">{status.next}</p>
          </aside>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
            <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Fee</dt>
            <dd className="nn-num nn-display mt-2 text-3xl text-nn-ink">
              {formatCollaborationMoney(offer)}
            </dd>
          </div>
          <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
            <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Post by</dt>
            <dd className="mt-3 text-sm font-bold text-nn-ink">
              {formatCollaborationDate(collaboration.postBy)}
            </dd>
          </div>
          <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
            <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Approval</dt>
            <dd className="mt-3 text-sm font-bold text-nn-ink">
              {collaboration.approvalRequired ? "Required before publishing" : "Not required"}
            </dd>
          </div>
        </dl>

        {collaboration.status === "accepted" ? (
          <div className="nn-card mt-8 p-6 sm:p-8">
            <h2 className="nn-display text-2xl text-nn-ink">Submit published content</h2>
            <SubmitContentForm collaborationId={collaboration.id} />
          </div>
        ) : null}

        {collaboration.contentUrl ? (
          <p className="mt-8 text-sm">
            <a
              href={collaboration.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-nn-blue hover:text-nn-blue-strong"
            >
              View submitted post <span aria-hidden="true">↗</span>
            </a>
          </p>
        ) : null}

        <MessageThread
          collaborationId={collaboration.id}
          creatorId={creatorId}
          creatorName={creatorName}
          currentUserId={creatorId}
          messages={messages}
        />
      </div>
    </CreatorShell>
  );
}
