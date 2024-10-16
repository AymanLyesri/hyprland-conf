local mlsp = require("mason-lspconfig")
mlsp.setup({
    ensure_installed = { "lua_ls", "ts_ls", "bashls", "html" }
})
--auto completion
local capabilities = require('cmp_nvim_lsp').default_capabilities()

--for automating lsp setup_handlers
mlsp.setup_handlers {
    function(server)
        require('lspconfig')[server].setup {
            on_attach = require("lsp-format").on_attach,
            capabilities = capabilities
        }
    end
}

vim.diagnostic.config({
    virtual_text = true,
    signs = true,
    underline = true,
    update_in_insert = true,
    severity_sort = false,
})
