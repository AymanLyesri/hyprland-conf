cp $HOME/.config/hypr/evremap/evremap.service /usr/lib/systemd/system/
systemctl daemon-reload
systemctl enable evremap.service
systemctl start evremap.service