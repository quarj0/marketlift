"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCheck,
  Flag,
  ImagePlus,
  MoreVertical,
  Send,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  InlineError,
  PageLoading,
} from "@/components/feedback/async-states";
import { ReportDialog } from "@/components/feedback/report-dialog";
import { messagingService } from "@/services/messaging.service";
import { formatBRL, formatConversationTimestamp, formatMessageTimestamp } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type SelectedAttachment = {
  file: File;
  previewUrl: string;
};

export function MessagesClient({ initialId }: { initialId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { t, tr, locale } = useLocale();

  const [selectedId, setSelectedId] = useState(initialId ?? "");
  const [text, setText] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [attachment, setAttachment] = useState<SelectedAttachment | null>(null);

  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: messagingService.getConversations,
  });

  const activeId = selectedId || conversations.data?.[0]?.id || "";

  const current = conversations.data?.find(
    (conversation) => conversation.id === activeId,
  );

  const messages = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => messagingService.getMessages(activeId),
    enabled: Boolean(activeId),
  });

  useEffect(() => {
    if (activeId) {
      void messagingService.markRead(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    return () => {
      if (attachment) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachment]);

  function clearAttachment() {
    if (attachment) {
      URL.revokeObjectURL(attachment.previewUrl);
    }

    setAttachment(null);
    setAttachmentError(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAttachmentError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setAttachmentError(t("messages.fileTypeError"));

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setAttachmentError(t("messages.fileSizeError"));

      event.target.value = "";
      return;
    }

    if (attachment) {
      URL.revokeObjectURL(attachment.previewUrl);
    }

    setAttachment({
      file,
      previewUrl: URL.createObjectURL(file),
    });

    event.target.value = "";
  }

  function changeConversation(conversationId: string) {
    clearAttachment();
    setText("");
    setReportOpen(false);

    if (window.innerWidth < 1024) {
      router.push(`/messages/${conversationId}`);
      return;
    }

    setSelectedId(conversationId);
  }

  const send = useMutation({
    mutationFn: () =>
      messagingService.sendMessage(activeId, {
        text: text.trim() || undefined,
        image: attachment?.file,
      }),

    onSuccess: async () => {
      setText("");
      clearAttachment();

      await queryClient.invalidateQueries({
        queryKey: ["messages", activeId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  if (conversations.isLoading) {
    return <PageLoading label={t("messages.loading")} />;
  }

  if (conversations.isError) {
    return (
      <InlineError
        title={t("messages.loadError")}
        description={t("messages.loadErrorBody")}
        onRetry={() => conversations.refetch()}
      />
    );
  }

  if (!conversations.data?.length) {
    return (
      <EmptyState
        title={t("messages.empty")}
        description={t("messages.emptyBody")}
        href="/search"
        action={t("messages.browse")}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm lg:grid lg:h-[min(720px,calc(100dvh-180px))] lg:min-h-155 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Conversation list */}
      <aside
        className={`${
          initialId ? "hidden lg:block" : "block"
        } min-w-0 border-r`}
        aria-label={t("messages.list")}
      >
        <div className="border-b p-4">
          <h2 className="text-lg font-black">{t("messages.title")}</h2>

          <p className="text-xs text-slate-500">
            {t("messages.subtitle")}
          </p>
        </div>

        <div className="divide-y">
          {conversations.data.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => changeConversation(conversation.id)}
              aria-pressed={activeId === conversation.id}
              className={`w-full p-4 text-left transition ${
                activeId === conversation.id
                  ? "bg-blue-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex gap-3">
                <Image
                  src={conversation.participant.avatar}
                  width={44}
                  height={44}
                  unoptimized
                  className="size-11 shrink-0 rounded-full object-cover"
                  alt={t("messages.avatar", { name: conversation.participant.name })}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="truncate text-sm font-black">
                      {conversation.participant.name}
                    </p>

                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatConversationTimestamp(conversation.lastMessageAt, locale)}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {conversation.lastMessage === "📷 Photo" ? tr(conversation.lastMessage) : conversation.lastMessage}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    {conversation.listing ? (
                      <span className="min-w-0 truncate text-[11px] font-semibold text-slate-400">
                        {conversation.listing.title}
                      </span>
                    ) : <span />}

                    {conversation.unread > 0 && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-700 text-[10px] font-black text-white">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Active conversation */}
      <section
        className={`${
          !initialId ? "hidden lg:flex" : "flex"
        } min-h-[calc(100dvh-140px)] min-w-0 flex-col lg:min-h-0`}
      >
        {current ? (
          <>
            {/* Header */}
            <header className="flex items-center gap-3 border-b p-3 sm:p-4">
              <Link
                href="/messages"
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 py-2 text-sm font-bold text-blue-700 focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
              >
                {t("messages.back")}
              </Link>

              <Image
                src={current.participant.avatar}
                width={40}
                height={40}
                unoptimized
                className="size-10 shrink-0 rounded-full object-cover"
                alt={t("messages.avatar", { name: current.participant.name })}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-black">
                    {current.participant.name}
                  </p>

                  {current.participant.verified && (
                    <ShieldCheck
                      className="size-4 shrink-0 text-emerald-600"
                      aria-label={t("messages.verified")}
                    />
                  )}
                </div>

                {current.listing && (
                  <p className="truncate text-xs text-slate-500">
                    {current.listing.title}
                  </p>
                )}
              </div>

              {/* Conversation menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("messages.options")}
                  >
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onSelect={() => {
                      setBlocked((value) => !value);
                    }}
                    className={
                      blocked
                        ? "cursor-pointer"
                        : "cursor-pointer text-rose-600 focus:text-rose-600"
                    }
                  >
                    <Ban className="size-4" />

                    {blocked ? t("messages.unblock") : t("messages.block")}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={() => {
                      /*
                       * The ReportDialog is mounted outside the
                       * dropdown, so closing this menu won't destroy
                       * the dialog before it opens.
                       */
                      setReportOpen(true);
                    }}
                    className="cursor-pointer text-rose-600 focus:text-rose-600"
                  >
                    <Flag className="size-4" />
                    {t("messages.report")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Keep modal OUTSIDE dropdown content */}
              <ReportDialog
                targetType="message"
                targetId={current.id}
                open={reportOpen}
                onOpenChange={setReportOpen}
              />
            </header>

            {/* Safety banner */}
            <div className="flex items-start gap-2 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {t("messages.safety")}
            </div>

            {/* Messages */}
            <div
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 sm:p-4"
              aria-live="polite"
            >
              {messages.isLoading && <PageLoading label={t("messages.loadingThread")} />}

              {messages.isError && (
                <InlineError
                  title={t("messages.threadError")}
                  onRetry={() => messages.refetch()}
                />
              )}

              {messages.data?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] overflow-hidden rounded-2xl text-sm shadow-sm sm:max-w-[72%] ${
                      message.sender === "me"
                        ? "bg-blue-700 text-white"
                        : "bg-white text-slate-900"
                    }`}
                  >
                    {message.attachment?.type === "image" && (
                      <div className="p-1.5 pb-0">
                        <Image
                          src={message.attachment.url}
                          alt={message.attachment.name || t("messages.sharedImage")}
                          width={420}
                          height={320}
                          unoptimized
                          className="max-h-80 w-auto max-w-full rounded-xl object-cover"
                        />
                      </div>
                    )}

                    <div className="px-4 py-3">
                      {message.text && (
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {message.text}
                        </p>
                      )}

                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          message.sender === "me"
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        {formatMessageTimestamp(message.createdAt, locale)}

                        {message.sender === "me" && (
                          <CheckCheck
                            className="size-3"
                            aria-label={message.read ? t("messages.read") : t("messages.sent")}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!messages.isLoading &&
                !messages.isError &&
                messages.data?.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {t("messages.noMessages")}
                  </p>
                )}
            </div>

            {/* Composer */}
            <div className="border-t bg-white p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
              {/* Listing */}
              {current.listing && (
                <Link
                  href={`/listing/${current.listing.slug}`}
                  className="mb-2 flex min-w-0 items-center gap-3 rounded-xl border bg-slate-50 p-2 transition hover:bg-slate-100"
                >
                  <Image
                    src={current.listing.images[0]}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 shrink-0 rounded-lg object-cover"
                    alt={current.listing.title}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">
                      {current.listing.title}
                    </p>

                    <p className="text-xs font-black text-blue-700">
                      {formatBRL(current.listing.price)}
                    </p>
                  </div>
                </Link>
              )}

              {/* Attachment preview */}
              {attachment && (
                <div className="mb-2 flex max-w-sm items-start gap-3 rounded-xl border bg-slate-50 p-2">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={attachment.previewUrl}
                      alt={t("messages.selectedImage")}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 py-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {attachment.file.name}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {new Intl.NumberFormat(locale === "pt-BR" ? "pt-BR" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(attachment.file.size / 1024 / 1024)} MB
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-emerald-700">
                      {t("messages.imageReady")}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    disabled={send.isPending}
                    onClick={clearAttachment}
                    aria-label={t("messages.removeImage")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              {attachmentError && (
                <p
                  className="mb-2 text-xs font-medium text-rose-600"
                  role="alert"
                >
                  {attachmentError}
                </p>
              )}

              <form
                className="flex min-w-0 items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (
                    (!text.trim() && !attachment) ||
                    blocked ||
                    send.isPending
                  ) {
                    return;
                  }

                  send.mutate();
                }}
              >
                {/* Image picker */}
                <div className="shrink-0">
                  <input
                    ref={imageInputRef}
                    id="message-image-picker"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={blocked || send.isPending}
                    onChange={handleImageChange}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    disabled={blocked || send.isPending}
                    onClick={() => imageInputRef.current?.click()}
                    aria-label={t("messages.attach")}
                    title={t("messages.attach")}
                  >
                    <ImagePlus className="size-5" />
                  </Button>
                </div>

                <Input
                  value={text}
                  disabled={blocked || send.isPending}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={
                    blocked
                      ? t("messages.blockedPlaceholder")
                      : attachment
                        ? t("messages.placeholderImage")
                        : t("messages.placeholder")
                  }
                  aria-label={t("messages.inputLabel")}
                />

                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 sm:w-auto sm:px-4"
                  disabled={
                    (!text.trim() && !attachment) || send.isPending || blocked
                  }
                  loading={send.isPending}
                  loadingText=""
                  aria-label={t("messages.sendLabel")}
                >
                  <Send className="size-4" />

                  <span className="hidden sm:inline">{t("messages.send")}</span>
                </Button>
              </form>

              <p className="mt-1.5 pl-1 text-[10px] text-slate-400">
                {t("messages.fileHint")}
              </p>

              {blocked && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  <Ban className="size-4 shrink-0" />
                  {t("messages.blockedNotice")}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-500">
            {t("messages.choose")}
          </div>
        )}
      </section>
    </div>
  );
}
