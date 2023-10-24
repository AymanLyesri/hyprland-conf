# Created by newuser for 5.9

#History
HISTSIZE=10000                   # Maximum events for internal history
SAVEHIST=10000                   # Maximum events in history file
HISTFILE=~/.cache/zsh/history    # History filepath

#version control
autoload -Uz vcs_info
precmd() { vcs_info }
zstyle ':vcs_info:git:*' formats '%b '

#Enable color and change prompt
setopt PROMPT_SUBST
PROMPT="%F{222}⤘%f %F{240}%m%f %F{red}卐%f %F{red}%n%f%F{240} ⮚ %f%F{222}%d%f%F{240} ⮚ %f"

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
NEOFETCH="neofetch --ascii /home/ayman/.config/hypr/neofetch/swastika --ascii_colors 240 1 --colors 240 240 240 240 240 240"
eval $NEOFETCH
alias n=$NEOFETCH 
alias neofetch=$NEOFETCH
alias vim=nvim
