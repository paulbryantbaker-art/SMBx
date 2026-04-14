/**
 * ConfirmHost — mounts once at the AppShell root, listens to the global
 * confirm() bus, and renders the current request via ConfirmSheet.
 */

import { useEffect, useState } from 'react';
import { settleConfirm, subscribeConfirms } from '../../lib/confirm';
import { ConfirmSheet } from './ConfirmSheet';

interface Props {
  dark: boolean;
}

export function ConfirmHost({ dark }: Props) {
  const [req, setReq] = useState<{
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  } | null>(null);

  useEffect(() => subscribeConfirms((r) => {
    if (r) setReq({
      title: r.title,
      body: r.body,
      confirmLabel: r.confirmLabel,
      cancelLabel: r.cancelLabel,
      destructive: r.destructive,
    });
    else setReq(null);
  }), []);

  return (
    <ConfirmSheet
      open={!!req}
      onOpenChange={(o) => { if (!o) settleConfirm(false); }}
      dark={dark}
      title={req?.title || ''}
      body={req?.body}
      confirmLabel={req?.confirmLabel}
      cancelLabel={req?.cancelLabel}
      destructive={req?.destructive}
      onConfirm={() => settleConfirm(true)}
      onCancel={() => settleConfirm(false)}
    />
  );
}

export default ConfirmHost;
