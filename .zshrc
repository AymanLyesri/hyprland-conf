(cat ~/.cache/wal/sequences &)
# (nohup $HOME/.config/hypr/theme/scripts/wal-theme.sh > /dev/null 2>&1 &) # set wallpaper theme

eval "$(starship init zsh)"

# fetch system information
source $HOME/.config/fastfetch/fastfetch.sh

source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh                   # Autosuggestions for commands
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh           # Syntax Highlighting and colors
source /usr/share/zsh/plugins/zsh-history-substring-search/zsh-history-substring-search.zsh # Substring history search using up and down arrow keys
source /usr/share/zsh/plugins/zsh-sudo/sudo.plugin.zsh
source /usr/share/zsh/plugins/zsh-auto-notify/auto-notify.plugin.zsh
source /usr/share/zsh/plugins/fzf-tab-git/fzf-tab.plugin.zsh

#Zsh Auto-Suggestions
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#696969,bold"
HISTSIZE=10000            # Maximum events for internal history
SAVEHIST=10000            # Maximum events in history file
HISTDIR=~/.cache/zsh      # History directory
HISTFILE=$HISTDIR/history # History filepath
mkdir -p "$HISTDIR"       # Create history directory if it doesn't exist
touch "$HISTDIR/history"  # Create history file if it doesn't exist

# Zsh Tab Complete
autoload -U compinit
# zstyle '*:compinit' arguments -D -i -u -C -w
# zstyle ':completion:*' completer _extensions _complete _approximate
# zstyle ':completion:*' menu select
# zstyle ':completion:*:*:*:*:descriptions' format '%F{2}-- %d --%f'
# zstyle ':completion:*:*:*:*:corrections' format '%F{208}!- %d (errors: %e) -!%f'
# zstyle ':completion:*:messages' format ' %F{11} -- %d --%f'
# zstyle ':completion:*:warnings' format ' %F{9}-- no matches found --%f'
compinit

#Zsh Substring History Search
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

############################################################

# Aliases for ls
alias ls='lsd'

# Aliases for cat
alias cat='bat'

# Aliases for fastfetch
alias f='clear && source $HOME/.config/fastfetch/fastfetch.sh'

# Aliase functions
function code() {
    /bin/code $1 && exit
}
function v() {
    /bin/neovide --fork $1 && exit
}
alias cpdir='pwd | tr -d "\r\n" | wl-copy'

# Test Connection
TEST_CONNECTION="/home/ayman/.config/hypr/scripts/test-connection.sh"
alias conn=$TEST_CONNECTION

# Aliases for neofetch
alias n=$NEOFETCH

# Aliases for logout
alias logout='hyprctl dispatch exit'

# Set up fzf key bindings and fuzzy completion
source <(fzf --zsh)

# MongoDb
# source <(mongocli completion zsh)

# Configuration Update
alias update='$HOME/.config/hypr/maintenance/UPDATE.sh'

# Waifu Chat Bot and Assistant
alias waifu='source $HOME/linux-chat-bot/main.sh "$(pwd)"'
