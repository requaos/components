// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import styles from './styles.css.js';
import React from 'react';
import { TableProps } from '../interfaces';

interface TableBodyCellProps {
  className?: string;
  style?: React.CSSProperties;
  wrapLines: boolean | undefined;
  isFirstRow: boolean;
  isLastRow: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isNextSelected: boolean;
  isPrevSelected: boolean;
  children?: React.ReactNode;
}

export function TableBodyCell({
  className,
  style,
  children,
  wrapLines,
  isFirstRow,
  isLastRow,
  isSelectable,
  isSelected,
  isNextSelected,
  isPrevSelected,
}: TableBodyCellProps) {
  return (
    <td
      style={style}
      className={clsx(
        className,
        styles['body-cell'],
        wrapLines && styles['body-cell-wrap'],
        isFirstRow && styles['body-cell-first-row'],
        isLastRow && styles['body-cell-last-row'],
        isSelectable && styles.selectable,
        isSelected && styles['body-cell-selected'],
        isNextSelected && styles['body-cell-next-selected'],
        isPrevSelected && styles['body-cell-prev-selected']
      )}
    >
      {children}
    </td>
  );
}

interface TableBodyCellContentProps<ItemType> extends TableBodyCellProps {
  column: TableProps.ColumnDefinition<ItemType>;
  item: ItemType;
}

export function TableBodyCellContent<ItemType>({ item, column, ...rest }: TableBodyCellContentProps<ItemType>) {
  return <TableBodyCell {...rest}>{column.cell(item)}</TableBodyCell>;
}
