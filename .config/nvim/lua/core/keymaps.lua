-- Set Key Mappings
vim.api.nvim_set_keymap('n', '<C-b>', ':Neotree toggle<CR>', { noremap = true, silent = true })
-- Example Lua key mappings
vim.api.nvim_set_keymap('n', 'j', 'h', { noremap = true })
vim.api.nvim_set_keymap('n', 'k', 'l', { noremap = true })
vim.api.nvim_set_keymap('n', 'h', 'j', { noremap = true })
vim.api.nvim_set_keymap('n', 'l', 'k', { noremap = true })
