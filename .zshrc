# Created by newuser for 5.9

# Dynamic Color scheme
(cat ~/.cache/wal/sequences &)

#History
HISTSIZE=10000                # Maximum events for internal history
SAVEHIST=10000                # Maximum events in history file
HISTFILE=~/.cache/zsh/history # History filepath

# Find and set branch name var if in git repository.
function git_branch_name() {
    branch=$(git symbolic-ref HEAD 2>/dev/null | awk 'BEGIN{FS="/"} {print $NF}')
    if [[ $branch == "" ]]; then
        :
    else
        echo '- ('$branch')'
    fi
}
# Enable substitution in the prompt.
setopt prompt_subst
# Config for prompt. PS1 synonym.
prompt='%2/ $(git_branch_name) > '
# Set up the prompt (with git branch name)
setopt PROMPT_SUBST
PROMPT='%n in ${PWD/#$HOME/~} ${vcs_info_msg_0_}%#'

#Enable color and change prompt
setopt PROMPT_SUBST
# PROMPT="%F{222}⤘%f %F{240}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{222}%d%f%F{240} ⮚ %f"
PROMPT="%F{red}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{yellow}%d%f%F{240} ⮚ %f"

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
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Neofetch
NEOFETCH="neofetch --config $HOME/.config/hypr/neofetch/config.conf --ascii $HOME/.config/hypr/neofetch/swastika"
eval "$NEOFETCH | lolcat"

# Aliases for neofetch
alias n=$NEOFETCH
alias neofetch=$NEOFETCH

# Aliases for neovide
alias v="neovide && exit"

# Aliases for ls
alias ls='lsd'

# Aliase functions
function code() {
    /bin/code $1 && exit
}

# Test Connection
TEST_CONNECTION="/home/ayman/.config/hypr/scripts/test-connection"
alias test=$TEST_CONNECTION

# Load Angular CLI autocompletion.
source <(ng completion script)
