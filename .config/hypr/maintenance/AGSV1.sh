echo "Setting up AGSv1... Temporarily"

mkdir $HOME/agsv1

cd $HOME/agsv1

cp $HOME/.config/hypr/maintenance/PKGBUILD .

makepkg -si

echo " Done."
