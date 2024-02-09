-- Set Key Mappings
vim.api.nvim_set_keymap('n', '<Leader>b', ':Neotree toggle<CR>', { noremap = true, silent = true })
-- Example Lua key mappings
vim.api.nvim_set_keymap('n', 'j', 'h', { noremap = true })
vim.api.nvim_set_keymap('n', 'k', 'l', { noremap = true })
vim.api.nvim_set_keymap('n', 'h', 'j', { noremap = true })
vim.api.nvim_set_keymap('n', 'l', 'k', { noremap = true })


-- terminal mappings
vim.api.nvim_set_keymap('n', '<Leader>t', ':ToggleTerm size=30 direction=vertical name=desktop<CR>',
    { noremap = true, silent = true })
