1. h, j, k, l: Fundamental movement keys in Vim.
   - h moves the cursor one character to the left.
   - j moves the cursor down one line.
   - k moves the cursor up one line.
   - l moves the cursor one character to the right.

2. w, b: Move the cursor by words.
   - w moves the cursor forward to the beginning of the next word.
   - b moves the cursor backward to the beginning of the previous word.

3. e: Move the cursor to the end of the current word.

4. 0, ^, $: Line positioning.
   - 0 moves the cursor to the beginning of the line.
   - ^ moves the cursor to the first non-blank character of the line.
   - $ moves the cursor to the end of the line.

5. {, }: Move the cursor by paragraph.
   - { moves the cursor to the beginning of the previous paragraph.
   - } moves the cursor to the beginning of the next paragraph.

6. G: Move the cursor to the specified line number.
   - G without a line number moves the cursor to the last line of the file.

7. gg: Move the cursor to the first line of the file.

8. f{char}, t{char}, F{char}, T{char}: Move to the next or previous occurrence of a character on the current line.
   - f{char} moves the cursor to the next occurrence of {char} on the current line.
   - t{char} moves the cursor to just before the next occurrence of {char} on the current line.
   - F{char} and T{char} are similar but move backwards.

9. %: Move the cursor to the matching opening or closing parenthesis, bracket, or brace.

10. /: Search forward for a pattern.
   - /pattern searches forward for the next occurrence of "pattern".

11. ?: Search backward for a pattern.
   - ?pattern searches backward for the previous occurrence of "pattern".
