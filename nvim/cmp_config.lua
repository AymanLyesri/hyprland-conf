-- cmp_config.lua

local cmp = require('cmp')

cmp.setup({
    snippet = {
        expand = function(args)
            -- You can add your own snippet support here
        end,
    },
    mapping = {
        ['<Tab>'] = cmp.mapping.select_next_item(),
        ['<S-Tab>'] = cmp.mapping.select_prev_item(),
        -- You can add more mappings here as needed
    },
    sources = {
        { name = 'nvim_lsp' }, -- LSP suggestions
        { name = 'buffer' },   -- Buffer suggestions
        { name = 'path' },     -- Path suggestions
        -- Add more sources as per your requirements
    },
})

return cmp
