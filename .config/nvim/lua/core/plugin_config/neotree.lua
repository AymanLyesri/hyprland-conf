require("neo-tree").setup({
    filesystem = {
        filtered_items = {
            visible = false, -- when true, they will just be displayed differently than normal items
            hide_dotfiles = false,
            hide_gitignored = false,
            hide_hidden = false, -- only works on Windows for hidden files/directories
            hide_by_name = {
                --"node_modules"
            },
            hide_by_pattern = { -- uses glob style patterns
                --"*.meta",
                --"*/src/*/tsconfig.json",
            },
            always_show = { -- remains visible even if other settings would normally hide it
                --".gitignored",
            },
            never_show = { -- remains hidden even if visible is toggled to true, this overrides always_show
                --".DS_Store",
                --"thumbs.db"
            },
            never_show_by_pattern = { -- uses glob style patterns
                --".null-ls_*",
            },
        },
        follow_current_file = {
            enabled = false,                    -- This will find and focus the file in the active buffer every time
            --               -- the current file is changed while the tree is open.
            leave_dirs_open = false,            -- `false` closes auto expanded dirs, such as with `:Neotree reveal`
        },
        group_empty_dirs = false,               -- when true, empty folders will be grouped together
        hijack_netrw_behavior = "open_default", -- netrw disabled, opening a directory opens neo-tree
        -- in whatever position is specified in window.position
        -- "open_current",  -- netrw disabled, opening a directory opens within the
        -- window like netrw would, regardless of window.position
        -- "disabled",    -- netrw left alone, neo-tree does not handle opening dirs
        use_libuv_file_watcher = false, -- This will use the OS level file watchers to detect changes
        -- instead of relying on nvim autocmd events.
        window = {
            mappings = {
                ["<bs>"] = "navigate_up",
                ["."] = "set_root",
                ["H"] = "toggle_hidden",
                ["/"] = "fuzzy_finder",
                ["D"] = "fuzzy_finder_directory",
                ["#"] = "fuzzy_sorter", -- fuzzy sorting using the fzy algorithm
                -- ["D"] = "fuzzy_sorter_directory",
                ["f"] = "filter_on_submit",
                ["<c-x>"] = "clear_filter",
                ["[g"] = "prev_git_modified",
                ["]g"] = "next_git_modified",
                ["o"] = { "show_help", nowait = false, config = { title = "Order by", prefix_key = "o" } },
                ["oc"] = { "order_by_created", nowait = false },
                ["od"] = { "order_by_diagnostics", nowait = false },
                ["og"] = { "order_by_git_status", nowait = false },
                ["om"] = { "order_by_modified", nowait = false },
                ["on"] = { "order_by_name", nowait = false },
                ["os"] = { "order_by_size", nowait = false },
                ["ot"] = { "order_by_type", nowait = false },
            },
            fuzzy_finder_mappings = { -- define keymaps for filter popup window in fuzzy_finder_mode
                ["<down>"] = "move_cursor_down",
                ["<C-n>"] = "move_cursor_down",
                ["<up>"] = "move_cursor_up",
                ["<C-p>"] = "move_cursor_up",
            },
        },

        commands = {} -- Add a custom command or override a global one using the same function name
    },
    buffers = {
        follow_current_file = {
            enabled = true,          -- This will find and focus the file in the active buffer every time
            --              -- the current file is changed while the tree is open.
            leave_dirs_open = false, -- `false` closes auto expanded dirs, such as with `:Neotree reveal`
        },
        group_empty_dirs = true,     -- when true, empty folders will be grouped together
        show_unloaded = true,
        window = {
            mappings = {
                ["bd"] = "buffer_delete",
                ["<bs>"] = "navigate_up",
                ["."] = "set_root",
                ["o"] = { "show_help", nowait = false, config = { title = "Order by", prefix_key = "o" } },
                ["oc"] = { "order_by_created", nowait = false },
                ["od"] = { "order_by_diagnostics", nowait = false },
                ["om"] = { "order_by_modified", nowait = false },
                ["on"] = { "order_by_name", nowait = false },
                ["os"] = { "order_by_size", nowait = false },
                ["ot"] = { "order_by_type", nowait = false },
            }
        },
    },
    git_status = {
        window = {
            position = "float",
            mappings = {
                ["A"]  = "git_add_all",
                ["gu"] = "git_unstage_file",
                ["ga"] = "git_add_file",
                ["gr"] = "git_revert_file",
                ["gc"] = "git_commit",
                ["gp"] = "git_push",
                ["gg"] = "git_commit_and_push",
                ["o"]  = { "show_help", nowait = false, config = { title = "Order by", prefix_key = "o" } },
                ["oc"] = { "order_by_created", nowait = false },
                ["od"] = { "order_by_diagnostics", nowait = false },
                ["om"] = { "order_by_modified", nowait = false },
                ["on"] = { "order_by_name", nowait = false },
                ["os"] = { "order_by_size", nowait = false },
                ["ot"] = { "order_by_type", nowait = false },
            }
        }
    }
})

vim.cmd([[nnoremap \ :Neotree reveal<cr>]])
