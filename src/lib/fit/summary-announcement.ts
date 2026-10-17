const pendingAnnouncements = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function announceFitStateChange(
  summary: HTMLElement,
  previousState: string,
  nextState: string,
  message: string,
): void {
  if (previousState === nextState) return;
  const status = summary.querySelector<HTMLElement>('[data-fit-state-announcement]');
  if (!status) return;

  const pending = pendingAnnouncements.get(status);
  if (pending !== undefined) clearTimeout(pending);
  pendingAnnouncements.set(
    status,
    setTimeout(() => {
      status.textContent = message;
      pendingAnnouncements.delete(status);
    }, 400),
  );
}
