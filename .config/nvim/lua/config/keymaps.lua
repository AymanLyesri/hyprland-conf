-- set space as the leader key
vim.g.mapleader = " "

-- Set Key Mappings
vim.api.nvim_set_keymap('n', '<Leader>bb', ':Neotree toggle<CR>', { noremap = true, silent = true })

--formatting keymaps
vim.api.nvim_set_keymap('n', '<Leader>fo', ':Format<CR>', { noremap = true, silent = true })

-- Reload nvim configuration
vim.api.nvim_set_keymap('n', '<Leader>r', ':source %<CR>', { noremap = true, silent = true })

-- Telescope mapping
vim.api.nvim_set_keymap('n', '<Leader>ff', ':Telescope find_files<CR>', { noremap = true, silent = true })

-- Save
vim.api.nvim_set_keymap('n', '<C-s>', ':w<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('i', '<C-s>', '<Esc>:w<CR>', { noremap = true, silent = true })

-- Buffer Manipulation
vim.api.nvim_set_keymap('n', '<C-Tab>', ':bnext<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<C-S-Tab>', ':bprevious<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<C-W>', ':BufferClose<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<Leader>ba', ':BufferLineCloseOthers<CR>', { noremap = true, silent = true })

-- Map Esc to Quit and Save & Quit
vim.api.nvim_set_keymap('n', '<Esc>', ':close <CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<C-Esc>', ':wq<CR>', { noremap = true, silent = true })

-- terminal mappings
vim.api.nvim_set_keymap('n', '<C-T>', ':ToggleTerm size=50 direction=float name=term<CR>',
    { noremap = true, silent = true })

-- Markdown Preview
vim.api.nvim_set_keymap('n', '<Leader>mdp', ':MarkdownPreviewToggle<CR>', { noremap = true, silent = true })

-- Mason
vim.api.nvim_set_keymap('n', '<Leader>mm', ':Mason<CR>', { noremap = true, silent = true })

-- Reload
vim.api.nvim_set_keymap('n', '<Leader>r', ':source $MYVIMRC<CR>', { noremap = true, silent = true })

-- Neotree
vim.api.nvim_set_keymap('n', '<C-B>', ':Neotree toggle<CR>', { noremap = true, silent = true })
