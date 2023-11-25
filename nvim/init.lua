package.path = "/home/ayman/.config/hypr/nvim/plugins.lua"
require('plugins')

-- local lfs = require('lfs')

-- -- Directory containing the Lua files
-- local dir = "/home/ayman/.config/hypr/nvim/"

-- -- Iterate over all files in the directory
-- for file in lfs.dir(dir) do
--     -- If the file is a Lua filelua-filesystem
--     if file:match(".lua$") then
--         -- Add the directory and file to the package path
--         package.path = package.path .. ";" .. dir .. file
--         -- Require the file without the .lua extension
--         require(file:sub(1, -5))
--     end
-- end


-- Set line numbers and relative line numbers
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.autoindent = true


-- Set encoding to UTF-8
vim.opt.encoding = "UTF-8"

-- Neovide settings
vim.g.neovide_padding_top = 0
vim.g.neovide_padding_bottom = 0
vim.g.neovide_padding_right = 0
vim.g.neovide_padding_left = 0

-- vim.g.neovide_transparency = 0.69
-- vim.g.transparency = 0.69
-- vim.g.neovide_background_color = '#0f1117' .. string.format('%x', math.floor(255 * vim.g.transparency))
