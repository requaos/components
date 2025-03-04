// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { act, render } from '@testing-library/react';
import createWrapper from '../../../lib/components/test-utils/dom';
import DateRangePicker, { DateRangePickerProps } from '../../../lib/components/date-range-picker';
import { i18nStrings } from './i18n-strings';
import { isValidRange } from './is-valid-range';
import { expectNoAxeViolations } from '../../__a11y__/axe';

const defaultProps: DateRangePickerProps = {
  locale: 'en-US',
  i18nStrings,
  value: null,
  placeholder: 'Test Placeholder',
  onChange: () => {},
  relativeOptions: [],
  isValidRange,
};

const outsideId = 'outside';
function renderDateRangePicker(props: DateRangePickerProps = defaultProps) {
  const ref = React.createRef<HTMLInputElement>();
  const { container, getByTestId, rerender } = render(
    <div>
      <button data-testid={outsideId} />
      <DateRangePicker {...props} ref={ref} />
    </div>
  );
  const wrapper = createWrapper(container).findDateRangePicker()!;

  const rerenderWrapper = (newProps: DateRangePickerProps = defaultProps) =>
    rerender(
      <div>
        <button data-testid={outsideId} />
        <DateRangePicker {...newProps} ref={ref} />
      </div>
    );

  return { wrapper, rerender: rerenderWrapper, ref, getByTestId };
}

let spy: jest.SpyInstance;
beforeEach(() => {
  spy = jest.spyOn(Date.prototype, 'getTimezoneOffset').mockImplementation(() => -8.75 * 60);
});
afterEach(() => {
  spy.mockRestore();
});

describe('Date range picker', () => {
  describe('absolute mode', () => {
    // TODO: https://dequeuniversity.com/rules/axe/4.4/aria-required-children?application=axeAPI
    test.skip('a11y checks with opened dropdown', async () => {
      const { container } = render(
        <DateRangePicker
          {...defaultProps}
          value={{
            type: 'absolute',
            startDate: '2018-01-02T05:00:00.000+08:45',
            endDate: '2018-01-05T13:00:00.15+08:45',
          }}
        />
      );
      const wrapper = createWrapper(container).findDateRangePicker()!;
      wrapper.findTrigger().click();

      await expectNoAxeViolations(container);
    });

    describe('form submission', () => {
      test('should not submit form when pressing buttons', () => {
        const onSubmit = jest.fn((e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          e.persist();
        });

        const { container } = render(
          <form onSubmit={onSubmit}>
            <DateRangePicker
              {...defaultProps}
              value={{
                type: 'absolute',
                startDate: '2018-01-02T05:00:00.000+08:45',
                endDate: '2018-01-05T13:00:00.15+08:45',
              }}
            />
          </form>
        );
        const wrapper = createWrapper(container).findDateRangePicker()!;

        wrapper.findTrigger().click();
        wrapper.findDropdown()!.findPreviousMonthButton().click();
        wrapper.findDropdown()!.findNextMonthButton().click();
        wrapper.findDropdown()!.findDateAt('left', 2, 1).click();
        wrapper.findDropdown()!.findDateAt('right', 2, 1).click();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    describe('data formats', () => {
      test('accepts optional milliseconds', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: {
            type: 'absolute',
            startDate: '2018-01-02T05:00:00.000+08:45',
            endDate: '2018-01-05T13:00:00.15+08:45',
          },
        });
        expect(wrapper.findTrigger().getElement()).toHaveTextContent(
          '2018-01-02T05:00:00+08:45 — 2018-01-05T13:00:00+08:45'
        );
      });
    });

    describe('selection', () => {
      test('formats dates with / in place of -', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2018-01-02T05:00:00+08:45', endDate: '2018-01-05T13:00:00+08:45' },
        });
        expect(wrapper.findTrigger().getElement()).toHaveTextContent(
          '2018-01-02T05:00:00+08:45 — 2018-01-05T13:00:00+08:45'
        );
      });

      test('shows the month of the selected start date by default', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2020-03-02T05:00:00+08:45', endDate: '2020-03-12T13:05:21+08:45' },
        });

        act(() => wrapper.findTrigger().click());

        expect(wrapper.findDropdown()!.findHeader().getElement()).toHaveTextContent('March 2020');
      });

      test('pre-fills the dropdown with the selected value', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2021-03-02T05:00:00+08:45', endDate: '2021-03-12T13:05:21+08:45' },
        });

        act(() => wrapper.findTrigger().click());

        expect(wrapper.findDropdown()!.findStartDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/02');
        expect(wrapper.findDropdown()!.findStartTimeInput()!.findNativeInput().getElement()).toHaveValue('05:00:00');

        expect(wrapper.findDropdown()!.findEndDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/12');
        expect(wrapper.findDropdown()!.findEndTimeInput()!.findNativeInput().getElement()).toHaveValue('13:05:21');

        expect(wrapper.findDropdown()!.findSelectedStartDate()!.getElement()).toHaveTextContent('2');
        expect(wrapper.findDropdown()!.findSelectedEndDate()!.getElement()).toHaveTextContent('12');
      });

      test('start date can be selected', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2021-03-02T05:00:00+08:45', endDate: '2021-03-12T13:05:21+08:45' },
        });
        act(() => wrapper.findTrigger().click());

        act(() => wrapper.findDropdown()!.findDateAt('left', 3, 4).click());

        expect(wrapper.findDropdown()!.findSelectedStartDate()!.getElement()).toHaveTextContent('17');
        expect(wrapper.findDropdown()!.findStartDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/17');
        expect(wrapper.findDropdown()!.findStartTimeInput()!.findNativeInput().getElement()).toHaveValue('00:00:00');
      });

      test('end date can be selected', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2021-03-02T05:00:00+08:45', endDate: '2021-03-12T13:05:21+08:45' },
        });
        act(() => wrapper.findTrigger().click());

        act(() => wrapper.findDropdown()!.findDateAt('left', 2, 3).click());
        act(() => wrapper.findDropdown()!.findDateAt('left', 3, 4).click());

        expect(wrapper.findDropdown()!.findSelectedEndDate()!.getElement()).toHaveTextContent('17');
        expect(wrapper.findDropdown()!.findEndDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/17');
        expect(wrapper.findDropdown()!.findEndTimeInput()!.findNativeInput().getElement()).toHaveValue('23:59:59');
      });

      test('selecting a range in reverse will flip the range correctly', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          value: { type: 'absolute', startDate: '2021-03-02T05:00:00+08:45', endDate: '2021-03-12T13:05:21+08:45' },
        });
        act(() => wrapper.findTrigger().click());

        act(() => wrapper.findDropdown()!.findDateAt('left', 3, 4).click());
        act(() => wrapper.findDropdown()!.findDateAt('left', 2, 3).click());

        expect(wrapper.findDropdown()!.findSelectedStartDate()!.getElement()).toHaveTextContent('9');
        expect(wrapper.findDropdown()!.findStartDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/09');
        expect(wrapper.findDropdown()!.findStartTimeInput()!.findNativeInput().getElement()).toHaveValue('00:00:00');

        expect(wrapper.findDropdown()!.findSelectedEndDate()!.getElement()).toHaveTextContent('17');
        expect(wrapper.findDropdown()!.findEndDateInput()!.findNativeInput().getElement()).toHaveValue('2021/03/17');
        expect(wrapper.findDropdown()!.findEndTimeInput()!.findNativeInput().getElement()).toHaveValue('23:59:59');
      });
    });

    describe('time offset', () => {
      test('creates values in the provided time offset', () => {
        const onChangeSpy = jest.fn();
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          timeOffset: 6.5 * 60,
          onChange: event => onChangeSpy(event.detail),
        });

        act(() => wrapper.findTrigger().click());

        act(() => wrapper.findDropdown()!.findStartDateInput()!.setInputValue('2018/05/10'));
        act(() => wrapper.findDropdown()!.findEndDateInput()!.setInputValue('2018/05/12'));

        act(() => wrapper.findDropdown()!.findApplyButton().click());

        expect(onChangeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            value: {
              type: 'absolute',
              startDate: '2018-05-10T00:00:00+06:30',
              endDate: '2018-05-12T23:59:59+06:30',
            },
          })
        );
      });

      test("creates values with the browser's default offset", () => {
        const onChangeSpy = jest.fn();
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          onChange: event => onChangeSpy(event.detail),
        });

        act(() => wrapper.findTrigger().click());

        act(() => wrapper.findDropdown()!.findStartDateInput()!.setInputValue('2018/05/10'));
        act(() => wrapper.findDropdown()!.findEndDateInput()!.setInputValue('2018/05/12'));

        act(() => wrapper.findDropdown()!.findApplyButton().click());

        expect(onChangeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            value: {
              type: 'absolute',
              startDate: '2018-05-10T00:00:00+08:45',
              endDate: '2018-05-12T23:59:59+08:45',
            },
          })
        );
      });

      test('transforms current value into the chosen time offset', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          timeOffset: -8 * 60,
          value: {
            type: 'absolute',
            startDate: '2018-01-02T05:00:00+04:00',
            endDate: '2018-01-05T13:00:00+04:00',
          },
        });

        expect(wrapper.findTrigger().getElement()).toHaveTextContent(
          '2018-01-01T17:00:00-08:00 — 2018-01-05T01:00:00-08:00'
        );

        act(() => wrapper.findTrigger().click());

        expect(wrapper.findDropdown()!.findStartTimeInput()!.findNativeInput().getElement()).toHaveValue('17:00:00');
        expect(wrapper.findDropdown()!.findEndTimeInput()!.findNativeInput().getElement()).toHaveValue('01:00:00');
      });

      test("understands the UTC timezone indicator 'Z'", () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          timeOffset: -8 * 60,
          value: {
            type: 'absolute',
            startDate: '2018-01-02T05:00:00Z',
            endDate: '2018-01-05T13:00:00-04:00',
          },
        });

        expect(wrapper.findTrigger().getElement()).toHaveTextContent(
          '2018-01-01T21:00:00-08:00 — 2018-01-05T09:00:00-08:00'
        );

        act(() => wrapper.findTrigger().click());

        expect(wrapper.findDropdown()!.findStartTimeInput()!.findNativeInput().getElement()).toHaveValue('21:00:00');
        expect(wrapper.findDropdown()!.findEndTimeInput()!.findNativeInput().getElement()).toHaveValue('09:00:00');
      });

      test('detects misformatted dates', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        try {
          const { wrapper } = renderDateRangePicker({
            ...defaultProps,
            value: {
              type: 'absolute',
              startDate: '2018-01-02T05:00:00+',
              endDate: '2018-01-05T13:00:00-04:00',
            },
          });
          expect(consoleSpy).toHaveBeenCalledTimes(1);
          expect(consoleSpy).toHaveBeenCalledWith(
            '[AwsUi] [DateRangePicker] You have provided a misformatted start or end date. The component will fall back to an empty value. Dates have to be ISO8601-formatted with an optional time zone offset.'
          );
          expect(wrapper.findTrigger().getElement()).toHaveTextContent('Test Placeholder');
        } finally {
          consoleSpy.mockRestore();
        }
      });

      test('correctly parses offsets >= 10', () => {
        {
          const { wrapper } = renderDateRangePicker({
            ...defaultProps,
            timeOffset: 10 * 60,
            value: {
              type: 'absolute',
              startDate: '2018-01-02T00:00:00+10:00',
              endDate: '2018-01-05T10:00:00+10:00',
            },
          });

          expect(wrapper.findTrigger().getElement()).toHaveTextContent(
            '2018-01-02T00:00:00+10:00 — 2018-01-05T10:00:00+10:00'
          );
        }

        {
          const { wrapper } = renderDateRangePicker({
            ...defaultProps,
            timeOffset: 20 * 60,
            value: {
              type: 'absolute',
              startDate: '2018-01-02T00:00:00+20:00',
              endDate: '2018-01-05T10:00:00+20:00',
            },
          });

          expect(wrapper.findTrigger().getElement()).toHaveTextContent(
            '2018-01-02T00:00:00+20:00 — 2018-01-05T10:00:00+20:00'
          );
        }
      });
    });

    describe('date-only', () => {
      test('shows warning when dateOnly changes', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        try {
          const { rerender } = renderDateRangePicker({ ...defaultProps, dateOnly: false });
          rerender({ ...defaultProps, dateOnly: true });
          rerender({ ...defaultProps, dateOnly: false });

          expect(consoleSpy).toHaveBeenCalledTimes(2);
          expect(consoleSpy).toHaveBeenCalledWith(
            '[AwsUi] [DateRangePicker] The provided `dateOnly` flag has been changed from "false" to "true" which can lead to unexpected value format. Consider using separate components.'
          );
          expect(consoleSpy).toHaveBeenCalledWith(
            '[AwsUi] [DateRangePicker] The provided `dateOnly` flag has been changed from "true" to "false" which can lead to unexpected value format. Consider using separate components.'
          );
        } finally {
          consoleSpy.mockRestore();
        }
      });

      test('formatted date-only range has no time part', () => {
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          dateOnly: true,
          value: { type: 'absolute', startDate: '2018-01-02', endDate: '2018-01-05' },
        });
        expect(wrapper.findTrigger().getElement()).toHaveTextContent('2018-01-02 — 2018-01-05');
      });

      test('date-only range is saved without time part', () => {
        const onChangeSpy = jest.fn();
        const { wrapper } = renderDateRangePicker({
          ...defaultProps,
          dateOnly: true,
          onChange: event => onChangeSpy(event.detail),
        });

        act(() => wrapper.findTrigger().click());
        act(() => wrapper.findDropdown()!.findStartDateInput()!.setInputValue('2018/05/10'));
        act(() => wrapper.findDropdown()!.findEndDateInput()!.setInputValue('2018/05/12'));
        act(() => wrapper.findDropdown()!.findApplyButton().click());

        expect(onChangeSpy).toHaveBeenCalledWith(
          expect.objectContaining({ value: { type: 'absolute', startDate: '2018-05-10', endDate: '2018-05-12' } })
        );
      });
    });
  });
});
