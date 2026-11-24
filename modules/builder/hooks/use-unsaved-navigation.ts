import { useEffect } from 'react';

const leaveMessage = 'You have unsaved changes. Leave anyway?';

export function useUnsavedNavigation(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const currentPath = window.location.pathname;
    const navigation = (
      window as Window & {
        navigation?: { currentEntry?: { index: number } };
      }
    ).navigation;
    let currentIndex = navigation?.currentEntry?.index;

    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    function onLinkClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (
        !link ||
        (link.target && link.target !== '_self') ||
        link.hasAttribute('download')
      )
        return;
      const destination = new URL(link.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === currentPath
      )
        return;

      if (!window.confirm(leaveMessage)) {
        event.preventDefault();
      }
    }

    function onPopState(event: PopStateEvent) {
      const nextIndex = navigation?.currentEntry?.index;
      if (window.location.pathname === currentPath) {
        currentIndex = nextIndex;
        return;
      }

      if (!window.confirm(leaveMessage)) {
        // The URL has changed already. Keep Next's popstate handler from
        // unmounting the draft while history returns to its original entry.
        event.stopImmediatePropagation();
        const offset =
          currentIndex !== undefined && nextIndex !== undefined
            ? currentIndex - nextIndex
            : 1;
        if (offset !== 0) window.history.go(offset);
      }
    }

    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('click', onLinkClick, true);
    window.addEventListener('popstate', onPopState, true);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('click', onLinkClick, true);
      window.removeEventListener('popstate', onPopState, true);
    };
  }, [isDirty]);
}
