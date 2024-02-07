local neotree = require('plugins.neotree')

require('packer').startup(function()
    use { 'wbthomason/packer.nvim', config = {
        -- Add auto-update settings
        auto_update = true
        },
    }
    use {neotree}
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

require('lualine').setup {
    options = {
        icons_enabled = true,
        theme = 'auto',
        component_separators = { left = '', right = '' },
        section_separators = { left = '', right = '' },
        disabled_filetypes = {
            statusline = {},
            winbar = {},
        },
        ignore_focus = {},
        always_divide_middle = true,
        globalstatus = false,
        refresh = {
            statusline = 1000,
            tabline = 1000,
            winbar = 1000,
        }
    },
    sections = {
        lualine_a = { 'mode' },
        lualine_b = { 'branch', 'diff', 'diagnostics' },
        lualine_c = { 'filename' },
        lualine_x = { 'encoding', 'fileformat', 'filetype' },
        lualine_y = { 'progress' },
        lualine_z = { 'location' }
    },
    inactive_sections = {
        lualine_a = {},
        lualine_b = {},
        lualine_c = { 'filename' },
        lualine_x = { 'location' },
        lualine_y = {},
        lualine_z = {}
    },
    tabline = {},
    winbar = {},
    inactive_winbar = {},
    extensions = {}
}

require('pywal').setup()

-- Set Key Mappings
vim.api.nvim_set_keymap('n', '<C-b>', ':Neotree toggle<CR>', { noremap = true, silent = true })
-- Example Lua key mappings
vim.api.nvim_set_keymap('n', 'j', 'h', { noremap = true })
vim.api.nvim_set_keymap('n', 'k', 'l', { noremap = true })
vim.api.nvim_set_keymap('n', 'h', 'j', { noremap = true })
vim.api.nvim_set_keymap('n', 'l', 'k', { noremap = true })


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

-- Automatically update Packer plugins when Neovim starts
vim.cmd [[autocmd VimEnter * PackerSync]]


-- vim.g.neovide_transparency = 0.69
-- vim.g.transparency = 0.69
-- vim.g.neovide_background_color = '#0f1117' .. string.format('%x', math.floor(255 * vim.g.transparency))
