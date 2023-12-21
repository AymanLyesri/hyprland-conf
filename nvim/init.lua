local packer = require('packer').startup(function()
    use {
        'kyazdani42/nvim-tree.lua',
        requires = 'kyazdani42/nvim-web-devicons'
    }
    use {
        'hrsh7th/nvim-cmp',
        requires = {
            'hrsh7th/cmp-buffer',   -- To suggest from the buffer
            'hrsh7th/cmp-nvim-lsp', -- For LSP-based suggestions
            'hrsh7th/cmp-path',     -- For file path suggestions
            -- Add more sources as per your requirements
        }
    }

    -- Add other plugins here as needed
    -- For example:
    -- use 'tpope/vim-surround'
    -- use 'preservim/nerdtree'
    -- use 'tpope/vim-commentary'
    -- use 'vim-airline/vim-airline'
    -- use 'lifepillar/pgsql.vim'
    -- use 'ap/vim-css-color'
    -- use 'rafi/awesome-vim-colorschemes'
    -- use 'neoclide/coc.nvim'
    -- use 'ryanoasis/vim-devicons'
    -- use 'tc50cal/vim-terminal'
    -- use 'preservim/tagbar'
    -- use 'terryma/vim-multiple-cursors'
end)

-- Set line numbers and relative line numbers
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.autoindent = true


-- Set encoding to UTF-8
vim.opt.encoding = "UTF-8"

-- Neovide settings
vim.g.neovide_padding_top = 0
vim.g.neovide_padding_bottom = 0
vim.g.neovide_padding_right = 0
vim.g.neovide_padding_left = 0

-- vim.g.neovide_transparency = 0.69
-- vim.g.transparency = 0.69
-- vim.g.neovide_background_color = '#0f1117' .. string.format('%x', math.floor(255 * vim.g.transparency))
