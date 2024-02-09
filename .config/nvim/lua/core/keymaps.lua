-- Set Key Mappings
vim.api.nvim_set_keymap('n', '<Leader>b', ':Neotree toggle<CR>', { noremap = true, silent = true })
-- Example Lua key mappings
vim.api.nvim_set_keymap('n', 'j', 'h', { noremap = true })
vim.api.nvim_set_keymap('n', 'k', 'l', { noremap = true })
vim.api.nvim_set_keymap('n', 'h', 'j', { noremap = true })
vim.api.nvim_set_keymap('n', 'l', 'k', { noremap = true })

-- Rebind directional window-switching keys for Dvorak layout
vim.api.nvim_set_keymap('n', '<C-w>n', '<C-w>h', { noremap = true })
vim.api.nvim_set_keymap('n', '<C-w>e', '<C-w>j', { noremap = true })
vim.api.nvim_set_keymap('n', '<C-w>i', '<C-w>k', { noremap = true })
vim.api.nvim_set_keymap('n', '<C-w>o', '<C-w>l', { noremap = true })

-- Reload nvim configuration
vim.api.nvim_set_keymap('n', '<Leader>r', ':source $MYVIMRC<CR>', { noremap = true, silent = true })


-- terminal mappings
vim.api.nvim_set_keymap('n', '<Leader>t', ':ToggleTerm size=50 direction=float name=term<CR>',
    { noremap = true, silent = true })
