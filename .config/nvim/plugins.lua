local packer = require('packer').startup(function()
    use { 'wbthomason/packer.nvim', config = {
        -- Add auto-update settings
        auto_update = true
    },
    }
    use {
        'nvim-lualine/lualine.nvim',
        requires = { 'nvim-tree/nvim-web-devicons', opt = true }
    }
    use 'neovim/nvim-lspconfig'
    use { 'AlphaTechnolog/pywal.nvim', as = 'pywal' }
    use {
        'nvim-treesitter/nvim-treesitter',
        run = function()
            local ts_update = require('nvim-treesitter.install').update({ with_sync = true })
            ts_update()
        end,
    }
    use {
        "nvim-neo-tree/neo-tree.nvim",
        branch = "v3.x",
        requires = {
            "nvim-lua/plenary.nvim",
            "nvim-tree/nvim-web-devicons", -- not strictly required, but recommended
            "MunifTanjim/nui.nvim",
            -- "3rd/image.nvim", -- Optional image support in preview window: See `# Preview Mode` for more information
        }
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

return packer
