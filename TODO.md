# Task: Refactor CreateList Page and Remove Unwanted Checklist Files

## Steps to Complete:

1. Rewrite `src/pages/CreateList.jsx`:
   - Move all code and functionality from `ChecklistBuilder.jsx` into `CreateList.jsx`.
   - Integrate the header fields UI and logic from `HeaderSection.jsx` directly into `CreateList.jsx`.
   - Integrate the footer fields UI and logic from `FooterSection.jsx` directly into `CreateList.jsx`.
   - Keep the existing `DashboardLayout` wrapper in place.
   - Include all checklist section management, adding/deleting rows, columns, sections, and cell editing.
   - Include submit checklist functionality and download options.
   - Remove all import dependencies on the deleted checklist components.

2. Delete Unwanted Files:
   - `src/components/checklist/ChecklistBuilder.jsx`
   - `src/components/checklist/HeaderSection.jsx`
   - `src/components/checklist/FooterSection.jsx`
   - `src/components/checklist/ChecklistTable.jsx`
   - `src/components/checklist/DeleteButton.jsx`

3. Test the refactored `CreateList.jsx`:
   - Validate that all checklist builder features work as before.
   - Confirm add/delete/edit of header/footer fields, sections, rows, and columns.
   - Confirm submission and download functionality.
   - Confirm page layout is correct with `DashboardLayout`.

4. Cleanup and finalize.

---

Once completed, provide summary of changes made.
