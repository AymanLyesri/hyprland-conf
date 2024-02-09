local plugins = {
    'andweeb/presence.nvim',
    'nvim-lualine/lualine.nvim',
    'AlphaTechnolog/pywal.nvim',
    'nvim-treesitter/nvim-treesitter',
    "williamboman/mason.nvim",
    "williamboman/mason-lspconfig.nvim",
    "neovim/nvim-lspconfig",
    "L3MON4D3/LuaSnip",
    { 'akinsho/toggleterm.nvim', version = "*", config = true },
    {
        "folke/which-key.nvim",
        event = "VeryLazy",
        init = function()
            vim.o.timeout = true
            vim.o.timeoutlen = 300
        end,
        opts = {
            -- your configuration comes here
            -- or leave it empty to use the default settings
            -- refer to the configuration section below
        }
    },
    {
        "nvim-neo-tree/neo-tree.nvim",
        branch = "v3.x",
        dependencies = {
            "nvim-lua/plenary.nvim",
            "nvim-tree/nvim-web-devicons", -- not strictly required, but recommended
            "MunifTanjim/nui.nvim",
            -- "3rd/image.nvim", -- Optional image support in preview window: See `# Preview Mode` for more information
        }
    },
      	"hrsh7th/nvim-cmp",
	"hrsh7th/cmp-nvim-lsp",
}

require("lazy").setup(plugins, opts)
