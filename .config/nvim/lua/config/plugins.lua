local plugins = {
    {
        "iamcco/markdown-preview.nvim",
        cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
        ft = { "markdown" },
        build = function() vim.fn["mkdp#util#install"]() end,
    },
    "nvim-tree/nvim-web-devicons",
    'andweeb/presence.nvim',
    --ui
    'nvim-lualine/lualine.nvim', --bottom bar
     {'romgrk/barbar.nvim',
    dependencies = {
      'lewis6991/gitsigns.nvim', -- OPTIONAL: for git status
      'nvim-tree/nvim-web-devicons', -- OPTIONAL: for file icons
    },
    init = function() vim.g.barbar_auto_setup = false end,
    opts = {
      -- lazy.nvim will automatically call setup for you. put your options here, anything missing will use the default:
      -- animation = true,
      -- insert_at_start = true,
      -- …etc.
    },
    version = '^1.0.0', -- optional: only update when a new 1.x version is released
  },
    -- { 'akinsho/bufferline.nvim',             version = "*", dependencies = 'nvim-tree/nvim-web-devicons' },

    --'navarasu/onedark.nvim',
    'AlphaTechnolog/pywal.nvim',
    {
        'nvim-telescope/telescope.nvim',
        dependencies = { 'nvim-lua/plenary.nvim' }
    },
    {
        "folke/noice.nvim",
        event = "VeryLazy",
        opts = {
        },
        dependencies = {
            "MunifTanjim/nui.nvim",
            "rcarriga/nvim-notify",
        }
    },
    {
        'goolord/alpha-nvim',
        dependencies = { 'nvim-tree/nvim-web-devicons' },
        config = function()
            require 'alpha'.setup(require 'alpha.themes.startify'.config)
        end
    },
    --highlight
    'nvim-treesitter/nvim-treesitter',
    { "lukas-reineke/indent-blankline.nvim", main = "ibl",  opts = {} },

    --lsp diagnostics
    "williamboman/mason.nvim",
    "williamboman/mason-lspconfig.nvim",
    "neovim/nvim-lspconfig",

    --completion
    "lukas-reineke/lsp-format.nvim",
    {
        "hrsh7th/nvim-cmp",
        opts = {
            sources = {
                {
                    name = "html-css",
                    option = {
                        enable_on = {
                            "html"
                        },                                           -- set the file types you want the plugin to work on
                        file_extensions = { "css", "sass", "less" }, -- set the local filetypes from which you want to derive classes
                        style_sheets = {
                            -- example of remote styles, only css no js for now
                            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
                            "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css",
                        }
                    },
                },
            },
        },
    },
    "hrsh7th/cmp-nvim-lsp",
    "L3MON4D3/LuaSnip",
    "saadparwaiz1/cmp_luasnip",
    "rafamadriz/friendly-snippets",
    "github/copilot.vim",
    "m4xshen/autoclose.nvim",
    {
        "Jezda1337/nvim-html-css",
        dependencies = {
            "nvim-treesitter/nvim-treesitter",
            "nvim-lua/plenary.nvim"
        },
        --config = function()
        --    require("html-css"):setup()
        --end
    },

    { 'akinsho/toggleterm.nvim', version = "*", config = true },
    {
        "folke/which-key.nvim",
        event = "VeryLazy",
        opts = {
        }
    },
    {
        "nvim-neo-tree/neo-tree.nvim",
        dependencies = {
            "nvim-lua/plenary.nvim",
            "MunifTanjim/nui.nvim",
            -- "3rd/image.nvim", -- Optional image support in preview window: See `# Preview Mode` for more information
        }
    },
}

require("lazy").setup(plugins)
