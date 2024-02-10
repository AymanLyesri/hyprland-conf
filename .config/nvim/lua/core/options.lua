-- Set line numbers and relative line numbers
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.autoindent = true

-- Set tab width to 4 spaces
vim.opt.tabstop = 4
-- Set indent width to 4 spaces
vim.opt.shiftwidth = 4
-- Use spaces instead of tabs for indentation
vim.opt.expandtab = true

-- Set italics for certain keywords
--vim.highlight.create('ColorColumn', { ctermbg = 0, guibg = lightgrey }, false)
-- Apply italic styling to comments
vim.cmd [[highlight Comment cterm=italic gui=italic]]
vim.cmd [[highlight Type cterm=italic gui=italic]]
vim.cmd [[highlight Function cterm=italic gui=italic]]
vim.cmd [[highlight Keyword cterm=italic gui=italic]]
vim.cmd [[highlight String cterm=italic gui=italic]]
vim.cmd [[highlight Number cterm=italic gui=italic]]


-- Set encoding to UTF-8
vim.opt.encoding = "UTF-8"

-- Neovide settings
--vim.g.neovide_padding_top = 0
--vim.g.neovide_padding_bottom = 0
--vim.g.neovide_padding_right = 0
--vim.g.neovide_padding_left = 0
vim.g.neovide_transparency = 0.69
vim.o.guifont = "Hack Nerd Font Mono:h14"
