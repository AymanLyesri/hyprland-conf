(cat ~/.cache/wal/sequences &)

# Neofetch
NEOFETCH="neofetch --config $HOME/.config/hypr/neofetch/config.conf --ascii $HOME/.config/hypr/neofetch/swastika | lolcat"
eval "$NEOFETCH"

# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f $HOME/.config/hypr/zsh/.p10k.zsh ]] || source $HOME/.config/hypr/zsh/.p10k.zsh

source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh/plugins/zsh-history-substring-search/zsh-history-substring-search.zsh
source /usr/share/zsh-theme-powerlevel10k/powerlevel10k.zsh-theme
source /usr/share/zsh/plugins/zsh-directory-history/zsh-directory-history.zsh
source /usr/share/zsh/plugins/zsh-sudo/sudo.plugin.zsh

#History
HISTSIZE=10000                # Maximum events for internal history
SAVEHIST=10000                # Maximum events in history file
HISTFILE=~/.cache/zsh/history # History filepath

#Enable color and change prompt
# setopt PROMPT_SUBST
# PROMPT="%F{222}⤘%f %F{240}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{222}%d%f%F{240} ⮚ %f"
# PROMPT="%F{red}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{yellow}%d%f%F{240} ⮚ %f"

#Zsh Tab Complete
autoload -U compinit
zstyle '*:compinit' arguments -D -i -u -C -w
zstyle ':completion:*' completer _extensions _complete _approximate
zstyle ':completion:*' menu select
zstyle ':completion:*:*:*:*:descriptions' format '%F{2}-- %d --%f'
zstyle ':completion:*:*:*:*:corrections' format '%F{208}!- %d (errors: %e) -!%f'
zstyle ':completion:*:messages' format ' %F{11} -- %d --%f'
zstyle ':completion:*:warnings' format ' %F{9}-- no matches found --%f'
compinit

#Zsh Auto-Suggestions
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#696969,bold"

#Zsh Substring History Search
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

TEST_CONNECTION="/home/ayman/.config/hypr/scripts/test-connection"

# Aliases for neovide
alias v="neovide && exit"

# Aliases for ls
alias ls='lsd'

# Aliase functions
function code() {
  /bin/code $1 && exit
}
function onedrive() {
  ranger $HOME/OneDrive && exit
}
function cpdir {
  pwd | tr -d "\r\n" | wl-copy
}

# Test Connection
alias test=$TEST_CONNECTION

# Aliases for angular
source <(ng completion script)

# Aliases for neofetch
alias n=$NEOFETCH


