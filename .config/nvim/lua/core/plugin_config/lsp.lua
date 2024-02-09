require("mason-lspconfig").setup({
	ensure_installed = { "lua_ls" }
})
--auto completion
local capabilities = require('cmp_nvim_lsp').default_capabilities()

require("lspconfig").lua_ls.setup {
	on_attach = require("lsp-format").on_attach,
	capabilities = capabilities
}

vim.diagnostic.config({
	virtual_text = true,
	signs = true,
	underline = true,
	update_in_insert = true,
	severity_sort = false,
})
