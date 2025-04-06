/**
 * Make header and column content center aligned.
 */
export const center = {
  columnHeaderContent: { style: { "justify-content": "center" } },
  bodyCell: { style: { "text-align": "center" } }
};

/**
 * Make header and column content right aligned.
 */
export const right = {
  columnHeaderContent: { style: { "justify-content": "right" } },
  bodyCell: { style: { "text-align": "right" } },
};

/**
 * Make header and column content right aligend.
 */
export const rightCell = {
  columnHeaderContent: { style: { "justify-content": "right" } },
  bodyCell: { style: { "text-align": "right" } },
  // TreeTable need this to invalidate .p-treetable-body-cell-content { display: flex; }
  // to make right alignment work.
  bodyCellContent: { style: { display: 'block' } }
};
