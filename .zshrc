# Created by newuser for 5.9

# Dynamic Color scheme
(cat ~/.cache/wal/sequences &)

#History
HISTSIZE=10000                   # Maximum events for internal history
SAVEHIST=10000                   # Maximum events in history file
HISTFILE=~/.cache/zsh/history    # History filepath

#version control
autoload -Uz vcs_info
precmd() { vcs_info }
zstyle ':vcs_info:git:*' formats '%b '

# Set up the prompt (with git branch name)
setopt PROMPT_SUBST
PROMPT='%n in ${PWD/#$HOME/~} ${vcs_info_msg_0_}%#'

#Enable color and change prompt
setopt PROMPT_SUBST
# PROMPT="%F{222}⤘%f %F{240}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{222}%d%f%F{240} ⮚ %f"
PROMPT="%F{red}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{yellow}%d%f%F{240} ⮚ %f"

#Zsh Tab Complete
autoload -U compinit
zstyle ':completion:*' menu select
compinit
_comp_options+=(globdots)

#Zsh Auto-Completion
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#ff00ff,bold"
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Neofetch
NEOFETCH="neofetch --config $HOME/.config/hypr/neofetch/config.conf --ascii $HOME/.config/hypr/neofetch/swastika --ascii_colors 240 1 --colors 240 240 240 240 240 240"
eval $NEOFETCH | lolcat

# Aliases
alias n=$NEOFETCH 
alias v="neovide && exit"
alias ranger="ranger -r /home/ayman/.config/hypr/ranger"

# Load Angular CLI autocompletion.
source <(ng completion script)
