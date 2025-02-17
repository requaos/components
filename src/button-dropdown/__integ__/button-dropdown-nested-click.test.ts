// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import useBrowser from '@cloudscape-design/browser-test-tools/use-browser';
import ButtonDropdownPage from '../../__integ__/page-objects/button-dropdown-page';

test(
  'follow external link in button dropdown group',
  useBrowser(async browser => {
    const page = new ButtonDropdownPage('ButtonDropdown4', browser);
    await browser.url('#/light/button-dropdown/simple');
    await page.waitForVisible(page.getTrigger());
    await page.openDropdown();
    await expect(page.isDropdownOpen()).resolves.toBe(true);
    await page.click('[data-testid=states]');
    await page.click('[data-testid=external]');

    expect(await browser.getWindowHandles()).toHaveLength(2);
  })
);
