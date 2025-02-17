// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import styles from './styles.css.js';
import useFocusVisible from '../../hooks/focus-visible';
import { useUniqueId } from '../../hooks/use-unique-id';
import { InternalBaseComponentProps } from '../../hooks/use-base-component/index.js';

export interface AbstractSwitchProps extends React.HTMLAttributes<HTMLElement>, InternalBaseComponentProps {
  controlId?: string;
  controlClassName: string;
  disabled?: boolean;
  nativeControl: (props: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactElement;
  styledControl: React.ReactElement;
  label?: React.ReactNode;
  description?: React.ReactNode;
  descriptionBottomPadding?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  withoutLabel?: boolean;
}

function joinString(values: (string | undefined)[]) {
  return values.filter((value): value is string => !!value).join(' ');
}

export default function AbstractSwitch({
  controlId,
  controlClassName,
  disabled,
  nativeControl,
  styledControl,
  label,
  description,
  descriptionBottomPadding,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  withoutLabel,
  __internalRootRef,
  ...rest
}: AbstractSwitchProps) {
  const uniqueId = useUniqueId();
  const id = controlId || uniqueId;

  const focusVisible = useFocusVisible();
  const wrapperId = `${id}-wrapper`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const WrapperElement = withoutLabel ? 'div' : 'label';
  const wrapperAttributes: Record<string, string | undefined> = {};
  if (!withoutLabel) {
    wrapperAttributes.id = wrapperId;
    wrapperAttributes.htmlFor = id;
  }

  const ariaLabelledByIds = [];
  if (label) {
    ariaLabelledByIds.push(labelId);
  }
  if (ariaLabelledby) {
    ariaLabelledByIds.push(ariaLabelledby);
  }

  const ariaDescriptons = [];
  if (ariaDescribedby) {
    ariaDescriptons.push(ariaDescribedby);
  }
  if (description) {
    ariaDescriptons.push(descriptionId);
  }

  return (
    <div {...rest} className={clsx(styles.wrapper, rest.className)} ref={__internalRootRef}>
      <WrapperElement
        {...wrapperAttributes}
        className={styles['label-wrapper']}
        aria-disabled={disabled ? 'true' : undefined}
      >
        <div className={clsx(styles.control, controlClassName)}>
          {styledControl}
          {nativeControl({
            ...focusVisible,
            id,
            disabled,
            'aria-describedby': ariaDescriptons.length ? joinString(ariaDescriptons) : undefined,
            'aria-labelledby': ariaLabelledByIds.length ? joinString(ariaLabelledByIds) : undefined,
            'aria-label': ariaLabel,
          })}
          {/*An empty div to display the outline, because the native control is invisible*/}
          <div className={styles.outline} />
        </div>
        <div className={clsx(styles.content, !label && !description && styles['empty-content'])}>
          {label && (
            <div id={labelId} className={clsx(styles.label, { [styles['label-disabled']]: disabled })}>
              {label}
            </div>
          )}
          {description && (
            <div
              id={descriptionId}
              className={clsx(styles.description, {
                [styles['description-disabled']]: disabled,
                [styles['description-bottom-padding']]: descriptionBottomPadding,
              })}
            >
              {description}
            </div>
          )}
        </div>
      </WrapperElement>
    </div>
  );
}
