local plugins = {
    "nvim-tree/nvim-web-devicons",
    'andweeb/presence.nvim',
    --ui
    'nvim-lualine/lualine.nvim',
    { 'akinsho/bufferline.nvim',             version = "*", dependencies = 'nvim-tree/nvim-web-devicons' },
    'navarasu/onedark.nvim',
    {
        'nvim-telescope/telescope.nvim',
        tag = '0.1.5',
        dependencies = { 'nvim-lua/plenary.nvim' }
    },
    {
        "folke/noice.nvim",
        event = "VeryLazy",
        opts = {
            -- add any options here
        },
        dependencies = {
            -- if you lazy-load any plugin below, make sure to add proper `module="..."` entries
            "MunifTanjim/nui.nvim",
            -- OPTIONAL:
            --   `nvim-notify` is only needed, if you want to use the notification view.
            --   If not available, we use `mini` as the fallback
            "rcarriga/nvim-notify",
        }
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
    "hrsh7th/nvim-cmp",
    "hrsh7th/cmp-nvim-lsp",
    "L3MON4D3/LuaSnip",
    "saadparwaiz1/cmp_luasnip",
    "rafamadriz/friendly-snippets",
    "github/copilot.vim",
    "m4xshen/autoclose.nvim",
    { 'akinsho/toggleterm.nvim', version = "*", config = true },
    {
        "folke/which-key.nvim",
        event = "VeryLazy",
        init = function()
            vim.o.timeout = true
            vim.o.timeoutlen = 300
        end,
        opts = {
        }
    },
    {
        "nvim-neo-tree/neo-tree.nvim",
        branch = "v3.x",
        dependencies = {
            "nvim-lua/plenary.nvim",
            "MunifTanjim/nui.nvim",
            -- "3rd/image.nvim", -- Optional image support in preview window: See `# Preview Mode` for more information
        }
    },
}

require("lazy").setup(plugins)
