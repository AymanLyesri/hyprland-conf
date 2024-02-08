local plugins = {
    'nvim-lualine/lualine.nvim',
    'AlphaTechnolog/pywal.nvim',
    'nvim-treesitter/nvim-treesitter',
    "williamboman/mason.nvim",
    "williamboman/mason-lspconfig.nvim",
    "neovim/nvim-lspconfig",
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
    {
        'hrsh7th/nvim-cmp',
        dependencies = {
            'hrsh7th/cmp-buffer',   -- To suggest from the buffer
            'hrsh7th/cmp-nvim-lsp', -- For LSP-based suggestions
            'hrsh7th/cmp-path',     -- For file path suggestions
            -- Add more sources as per your requirements
        }
    }
}

require("lazy").setup(plugins, opts)
