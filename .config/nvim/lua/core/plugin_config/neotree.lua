require("neo-tree").setup({
	filesystem = {
		filtered_items = {
			visible = false, -- when true, they will just be displayed differently than normal items
			hide_dotfiles = false,
			hide_gitignored = false,
			hide_hidden = false, -- only works on Windows for hidden files/directories
		},
	},
	window = {
		position = "right",
	}
})

--vim.cmd([[nnoremap \ :Neotree reveal<cr>]])
