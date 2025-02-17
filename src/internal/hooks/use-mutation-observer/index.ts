// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect } from 'react';
import { useStableEventHandler } from '../use-stable-event-handler';
import { createSingletonHandler } from '../use-singleton-handler';

const useMutationSingleton = createSingletonHandler<void>(handler => {
  const observer = new MutationObserver(() => handler());
  observer.observe(document.body, { attributes: true, subtree: true });
  return () => observer.disconnect();
});

export function useMutationObserver(
  elementRef: React.RefObject<HTMLElement>,
  onChange: (element: HTMLElement) => void
) {
  const handler = useStableEventHandler(() => {
    if (elementRef.current) {
      onChange(elementRef.current);
    }
  });
  useMutationSingleton(handler);

  useEffect(() => {
    handler();
  }, [handler]);
}
