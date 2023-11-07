local plugins = {
  {
    "lervag/vimtex",
    ft = "tex"
  },{
    "elkowar/yuck.vim",
    ft = "yuck"
  },{
    "sbdchd/neoformat"
  },

 {
   "williamboman/mason.nvim",
   opts = {
      ensure_installed = {
        "lua-language-server",
        "html-lsp",
        "prettier",
        "stylua"
      },
    },
  },
-- In order to modify the `lspconfig` configuration:
{
    "neovim/nvim-lspconfig",
    dependencies = {
      "jose-elias-alvarez/null-ls.nvim",
      config = function()
        require "custom.null-ls"
      end,
    },
   config = function()
      require "plugins.configs.lspconfig"
      require "custom.lspconfig"
   end,
},
 -- {
 --   config = function()
 --     require "plugins.configs.lspconfig"
----     require "custom.configs.lspconfig"
 --   end,
 -- }
}

return plugins
