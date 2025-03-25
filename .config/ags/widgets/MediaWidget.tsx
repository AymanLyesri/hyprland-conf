import { Box, Label } from "astal/gtk3/widget";
import Player from "./Player";
import { Astal, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";
const mpris = Mpris.get_default();

const noPlayerFound = () => (
  <Box
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    hexpand={true}
    className="module"
    child={<Label label="No player found" />}></Box>
);

const activePlayer = () => {
  if (mpris.players.length == 0) return noPlayerFound();

  const player =
    mpris.players.find(
      (player) => player.playbackStatus === Mpris.PlaybackStatus.PLAYING
    ) || mpris.players[0];

  // return Player(player, "widget");
  return <Player player={player} playerType="widget" />;
};

const Media = () => (
  <Box
    child={bind(mpris, "players").as((arr) =>
      arr.length > 0 ? activePlayer() : noPlayerFound()
    )}
  />
);

export default () => Media();
