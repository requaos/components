// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { render } from '@testing-library/react';
import { SplitPanelProps } from '../../../lib/components/split-panel';
import createWrapper, { ElementWrapper } from '../../../lib/components/test-utils/dom';
import { useMobile } from '../../../lib/components/internal/hooks/use-mobile';
import { useVisualRefresh } from '../../../lib/components/internal/hooks/use-visual-mode';
import styles from '../../../lib/components/app-layout/styles.css.js';
import visualRefreshStyles from '../../../lib/components/app-layout/visual-refresh/styles.css.js';
import testutilStyles from '../../../lib/components/app-layout/test-classes/styles.css.js';

// Mock element queries result. Note that in order to work, this mock should be applied first, before the AppLayout is required
jest.mock('../../../lib/components/internal/hooks/use-mobile', () => ({
  useMobile: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../lib/components/internal/hooks/use-visual-mode', () => ({
  useVisualRefresh: jest.fn().mockReturnValue(false),
  useDensityMode: jest.fn().mockReturnValue('comfortable'),
  useReducedMotion: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../lib/components/internal/motion', () => ({
  isMotionDisabled: jest.fn().mockReturnValue(true),
}));

export function renderComponent(jsx: React.ReactElement) {
  const { container, rerender } = render(jsx);
  const wrapper = createWrapper(container).findAppLayout()!;

  const isUsingGridLayout = wrapper.getElement().classList.contains(visualRefreshStyles.layout);

  const contentElement = isUsingGridLayout
    ? wrapper.getElement()
    : wrapper.findByClassName(styles['layout-wrapper'])!.getElement();

  return { wrapper, rerender, isUsingGridLayout, contentElement };
}

export function describeDesktopAppLayout(callback: () => void) {
  describe('Desktop', () => {
    beforeEach(() => {
      (useMobile as jest.Mock).mockReturnValue(false);
    });
    callback();
  });
}

export function describeMobileAppLayout(callback: () => void) {
  describe('Mobile', () => {
    beforeEach(() => {
      (useMobile as jest.Mock).mockReturnValue(true);
    });
    callback();
  });
}

export function describeEachThemeAppLayout(isMobile: boolean, callback: (theme: string) => void) {
  for (const theme of ['refresh', 'classic']) {
    describe(`${isMobile ? 'Mobile' : 'Desktop'}, Theme=${theme}`, () => {
      beforeEach(() => {
        (useMobile as jest.Mock).mockReturnValue(isMobile);
        (useVisualRefresh as jest.Mock).mockReturnValue(theme === 'refresh');
      });
      afterEach(() => {
        (useMobile as jest.Mock).mockReset();
        (useVisualRefresh as jest.Mock).mockReset();
      });
      callback(theme);
    });
  }
}

export function describeEachAppLayout(callback: () => void) {
  for (const theme of ['refresh', 'classic']) {
    for (const size of ['desktop', 'mobile']) {
      describe(`Theme=${theme}, Size=${size}`, () => {
        beforeEach(() => {
          (useMobile as jest.Mock).mockReturnValue(size === 'mobile');
          (useVisualRefresh as jest.Mock).mockReturnValue(theme === 'refresh');
        });
        afterEach(() => {
          (useMobile as jest.Mock).mockReset();
          (useVisualRefresh as jest.Mock).mockReset();
        });
        callback();
      });
    }
  }
}

export function isDrawerClosed(drawer: ElementWrapper) {
  const element = drawer.getElement();

  // The visibility class name we are attaching to the wrapping element,
  // however the test-util points to the inner element, which has the scrollbar
  if (element.parentElement!.classList.contains(styles['drawer-closed'])) {
    return true;
  }
  // Apply the same logic for the visual refresh app-layout where the testutils selector is used.
  if (element.parentElement!.classList.contains(testutilStyles['drawer-closed'])) {
    return true;
  }
  return false;
}

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  preferencesTitle: 'Preferences',
  preferencesPositionLabel: 'Position',
  preferencesPositionDescription: 'Choose the default split panel position.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  resizeHandleAriaLabel: 'Resize panel',
};
