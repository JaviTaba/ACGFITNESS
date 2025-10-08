"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { ShareIcon } from "@heroicons/react/24/solid";

export function StreakCelebration({
  open,
  streak,
  onOpenChange
}: {
  open: boolean;
  streak: number;
  onOpenChange: (open: boolean) => void;
}) {
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setShareCopied(false);
    }
  }, [open]);

  const shareMessage = `I just hit a ${streak}-day streak on AcogoFitness!`; 

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur" />
        <Dialog.Content className="fixed inset-x-4 bottom-12 z-50 mx-auto max-w-md rounded-3xl border border-brand-purple/40 bg-slate-900/95 p-6 text-center shadow-2xl shadow-brand-purple/50">
          <Dialog.Title className="text-xl font-semibold text-brand-lime">{streak}-day streak! 🔥</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-300">
            Keep the momentum going. Share this milestone with your crew?
          </Dialog.Description>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs text-slate-400">
            {shareMessage}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={async () => {
                if ("clipboard" in navigator) {
                  await navigator.clipboard.writeText(shareMessage);
                  setShareCopied(true);
                } else {
                  setShareCopied(true);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-brand-lime px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
            >
              <ShareIcon className="h-4 w-4" />
              {shareCopied ? "Copied!" : "Copy to share"}
            </button>
            <Dialog.Close className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-brand-lime hover:text-brand-lime">
              Not now
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
