cp evremap.service /usr/lib/systemd/system/
systemctl daemon-reload
systemctl enable evremap.service
systemctl start evremap.service