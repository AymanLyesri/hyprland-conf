local plugins = {
  {
    "lervag/vimtex",
    ft = "tex"
  },{
    "elkowar/yuck.vim",
    ft = "yuck"
  },
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
--     require "custom.configs.lspconfig"
    end,
  }
}

return plugins
