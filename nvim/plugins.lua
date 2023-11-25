-- Plugin management using Packer
local packer = require('packer').startup(function()
    use {
        'kyazdani42/nvim-tree.lua',
        requires = 'kyazdani42/nvim-web-devicons'
    }
    use {
        'hrsh7th/nvim-cmp',
        requires = {
            'hrsh7th/cmp-buffer', -- To suggest from the buffer
            'hrsh7th/cmp-nvim-lsp', -- For LSP-based suggestions
            'hrsh7th/cmp-path', -- For file path suggestions
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

return packer
