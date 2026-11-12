interface CloseErrorOptions {
  onClose?: () => void;
  retry: boolean;
  localBrowser: boolean;
  goHome: () => void;
  goBack: () => void;
  closeWebview: () => void;
}

export function closeError({
  onClose,
  retry,
  localBrowser,
  goHome,
  goBack,
  closeWebview,
}: CloseErrorOptions) {
  if (onClose) {
    onClose();
  } else if (localBrowser) {
    goHome();
  } else if (retry) {
    closeWebview();
  } else {
    goBack();
  }
}
